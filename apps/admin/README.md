# Admin 项目

这是一个基于 Next.js 的管理后台基础框架。

## Tailwind CSS 配置说明

### 1. 安装依赖

```bash
yarn add tailwindcss @tailwindcss/postcss postcss
```

### 2. 必需的配置文件

#### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}", // 共享 UI 组件
  ],
  theme: {
    extend: {
      // 在这里扩展或覆盖默认主题
    },
  },
  plugins: [],
};

export default config;
```

#### postcss.config.js
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### 3. 样式引入

在 `app/globals.css` 文件中添加以下内容：

```css
@import "tailwindcss";

/* 其他全局样式 */
```

### 4. 使用示例

```tsx
// 页面布局示例
export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
        </div>
      </nav>
      
      {/* 内容区域 */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 卡片组件 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">数据统计</h2>
            <p className="text-gray-600">使用 Tailwind 的工具类快速构建界面</p>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 常用工具类说明

- 布局类：
  - `flex`, `grid` - 弹性布局和网格布局
  - `p-{size}` - 内边距
  - `m-{size}` - 外边距
  - `w-{size}`, `h-{size}` - 宽度和高度

- 样式类：
  - `bg-{color}` - 背景颜色
  - `text-{color}` - 文字颜色
  - `font-{weight}` - 字体粗细
  - `rounded-{size}` - 圆角
  - `shadow-{size}` - 阴影

- 响应式类：
  - `sm:` - 640px 以上
  - `md:` - 768px 以上
  - `lg:` - 1024px 以上
  - `xl:` - 1280px 以上


## 项目结构

```
admin/
  ├── app/                # App Router 目录
  │   ├── globals.css    # 全局样式
  │   └── layout.tsx     # 根布局
  ├── src/
  │   ├── components/    # 组件目录
  │   └── stores/       # 状态管理目录
  ├── tailwind.config.ts # Tailwind 配置
  └── postcss.config.js  # PostCSS 配置
```


@是路劲别名，具体查看tsconfig
使用zustand状态管理，具体查看stores，增加两个中间件 ，一个是devtools支持redux devtools调试器，一个是persist持久化数据到localstorage
字体引用要先改next.config.js，然后使用相对于app目录的路劲