## 注意事项
Turborepo 本质上是一个用于优化 monorepo（单仓多模块）工作流的工具，是在一个单一的仓库中集中管理所有项目的构建、测试和发布流程，简化了配置和维护的工作量，可以在多个项目之间共享通用的组件或库，避免了重复造轮子的情况。
但是假如你在apps里面的子模块变成了Git Submodules，那么你得子模块就是一个独立的Git仓库，本质上是一个指向另外一个Git仓库的链接，所以没法引用到共享代码。

## 添加 Git Submodules 的方式
1. 创建一个独立的Git仓库
2. 在本项目中运行 git submodule add <your-docs-repo-url> apps/web ,通过这种方式添加一个git submodules

## 项目内容

此 Turborepo 包含以下应用和包：

### 应用和包

- `docs`：一个 [Next.js](https://nextjs.org/) 应用
- `web`：另一个 [Next.js](https://nextjs.org/) 应用
- `@repo/ui`：一个被 `web` 和 `docs` 应用共享的 React 组件库
- `@repo/eslint-config`：`eslint` 配置（包含 `eslint-config-next` 和 `eslint-config-prettier`）
- `@repo/typescript-config`：整个 monorepo 中使用的 `tsconfig.json` 配置

所有的应用和包均使用 100% 的 [TypeScript](https://www.typescriptlang.org/)。

### 工具集

这个 Turborepo 已经为你配置好了以下额外工具：

- [TypeScript](https://www.typescriptlang.org/) 用于静态类型检查
- [ESLint](https://eslint.org/) 用于代码检查
- [Prettier](https://prettier.io) 用于代码格式化

### 构建

要构建所有应用和包，运行以下命令：

```
cd my-turborepo
yarn build
```

### 开发

要开发所有应用和包，运行以下命令：

```
cd my-turborepo
yarn dev
```

### 远程缓存

> [!提示]
> Vercel 远程缓存对所有计划都是免费的。立即在 [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache) 开始使用。

Turborepo 可以使用称为[远程缓存](https://turborepo.com/docs/core-concepts/remote-caching)的技术在机器之间共享缓存，使你能够与团队和 CI/CD 管道共享构建缓存。

默认情况下，Turborepo 将在本地缓存。要启用远程缓存，你需要一个 Vercel 账户。如果你没有账户，可以[创建一个](https://vercel.com/signup?utm_source=turborepo-examples)，然后输入以下命令：

```
cd my-turborepo
npx turbo login
```

这将使用你的 [Vercel 账户](https://vercel.com/docs/concepts/personal-accounts/overview) 验证 Turborepo CLI。

接下来，你可以通过在 Turborepo 根目录运行以下命令将你的 Turborepo 链接到远程缓存：

```
npx turbo link
```

## 有用链接

了解更多 Turborepo 的强大功能：

- [任务](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [缓存](https://turborepo.com/docs/crafting-your-repository/caching)
- [远程缓存](https://turborepo.com/docs/core-concepts/remote-caching)
- [过滤](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [配置选项](https://turborepo.com/docs/reference/configuration)
- [CLI 使用](https://turborepo.com/docs/reference/command-line-reference)
