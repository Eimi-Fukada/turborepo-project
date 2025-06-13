## @tanstack/react-query 核心知识点

`@tanstack/react-query` 是一个用于管理服务器状态（Server State）的强大工具库。它可以帮助你轻松地进行数据获取、缓存、同步和更新操作，同时提供了丰富的配置选项来满足各种复杂场景的需求。

### 什么是 Server State？

在前端开发中，Server State 指的是那些从服务器获取并展示给用户的数据，例如用户信息、订单列表、文章内容等。与客户端状态（如表单输入、UI 状态）不同，Server State 需要通过网络请求从服务器获取，并且可能会随着时间变化而更新。

### React Query 的核心功能

1. **自动缓存**：React Query 会自动缓存最近获取的数据，避免重复请求相同资源。
2. **后台刷新**：即使组件卸载后重新挂载，React Query 也能从缓存中恢复数据，并在后台刷新。
3. **错误处理**：提供统一的错误处理机制，支持重试策略。
4. **分页 & 排序 & 过滤**：支持复杂的查询逻辑，如分页、排序和过滤。
5. **乐观更新**：允许你在等待服务器响应之前就更新 UI，提高用户体验。
6. **多数据源支持**：可以同时管理多个 API 或数据源的状态。
7. **TypeScript 支持**：完全支持 TypeScript，类型推导非常完善。

### React Query 的核心概念

#### 1. `useQuery`

`useQuery` 是 React Query 中最常用的钩子函数，用于获取只读数据。

```ts
import { useQuery } from '@tanstack/react-query';

function UserList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['users'], // 唯一标识符，通常是一个数组
    queryFn: () => fetch('/api/users').then(res => res.json()), // 获取数据的函数
    retry: 1, // 请求失败时重试次数
    staleTime: 1000 * 60 * 5, // 数据新鲜时间（毫秒），超过这个时间后再次访问会触发重新获取
    cacheTime: 1000 * 60 * 10, // 缓存时间（毫秒），超过这个时间后缓存将被清除
    refetchOnWindowFocus: false, // 是否在窗口聚焦时重新获取数据
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

##### 配置项说明

- `queryKey`: 用于唯一标识查询的键值，通常是字符串或对象数组。
- `queryFn`: 实际执行数据获取的函数，必须返回一个 Promise。
- `retry`: 请求失败时的重试次数。
- `staleTime`: 数据被认为是“新鲜”的时间（单位为毫秒）。在这段时间内，即使多次调用 `useQuery`，也不会重新获取数据。
- `cacheTime`: 数据在缓存中的保留时间（单位为毫秒）。超过这个时间后，缓存将被清除。
- `refetchOnWindowFocus`: 当浏览器窗口重新获得焦点时是否重新获取数据。
- `enabled`: 控制是否启用该查询，默认为 `true`。设置为 `false` 时，查询不会自动执行。

#### 2. `useMutation`

`useMutation` 用于处理写入操作（如 POST、PUT、DELETE），通常用于创建、更新或删除数据。

```ts
import { useMutation } from '@tanstack/react-query';

function CreateUser() {
  const { mutate, isPending } = useMutation({
    mutationFn: async (userData) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    },
    onSuccess: (data) => {
      console.log('User created:', data);
      // 可以在这里触发其他操作，如刷新用户列表
    },
    onError: (error) => {
      console.error('Error creating user:', error);
    },
  });

  const handleSubmit = async () => {
    try {
      await mutate({
        name: 'John Doe',
      });
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create User'}
    </button>
  );
}
```

##### 配置项说明

- `mutationFn`: 执行写入操作的函数，必须返回一个 Promise。
- `onSuccess`: 成功执行后的回调函数。
- `onError`: 出现错误时的回调函数。
- `onSettled`: 不论成功还是失败都会执行的回调函数。

#### 3. `QueryClient`

`QueryClient` 是 React Query 的核心类，用于管理所有查询的状态。

```ts
import { QueryClient } from '@tanstack/react-query';

// 创建 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

你可以通过 `QueryClientProvider` 将 `queryClient` 提供给整个应用。

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './react-query';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  );
}
```