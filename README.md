## 注意事项
Turborepo 本质上是一个用于优化 monorepo（单仓多模块）工作流的工具，是在一个单一的仓库中集中管理所有项目的构建、测试和发布流程，简化了配置和维护的工作量，可以在多个项目之间共享通用的组件或库，避免了重复造轮子的情况。
但是假如你在apps里面的子模块变成了Git Submodules，那么你得子模块就是一个独立的Git仓库，本质上是一个指向另外一个Git仓库的链接，所以没法引用到共享代码。

## 添加 Git Submodules 的方式
1. 创建一个独立的Git仓库
2. 在本项目中运行 git submodule add <your-docs-repo-url> apps/web ,通过这种方式添加一个git submodules

## 项目架构
### 整体架构
- **Monorepo 架构**：通过 Turborepo 实现多模块管理和统一的构建、测试和发布流程。
- **应用结构**：
  - `apps` 目录包含具体的应用项目，如 `admin`、`docs`、`system1`、`system2` 和 `web`。
  - `packages` 目录包含共享的包，如 `ui`、`admin-framework`、`eslint-config`、`prettier-config`、`typescript-config` 和 `shared-request`。

### 技术选型
#### 使用的主要技术栈和框架
- 框架: Next.js
- 语言: TypeScript
- 构建工具: Turborepo
- 包管理: Yarn Workspaces
- 代码规范: ESLint + Prettier
- Git提交: Commitlint + Husky

### 项目结构

```
apps/
  ├── admin/         # 后台管理框架 (展示应用)
  ├── system1/      # 业务子应用1
  ├── system2/      # 业务子应用2
  ├── docs/         # 文档站点
  └── web/          # 门户网站
packages/
  ├── ui/           # 共享UI组件库
  ├── admin-framework/     # 后台专用组件库
  ├── eslint-config/    # ESLint 配置
  ├── typescript-config/ # TypeScript 配置
  ├── shared-request/ # 共享request库
  └── prettier-config/   # Prettier 配置
```

### 主要改进

从传统项目迁移到 Turborepo 后的主要改进：

1. **构建性能**
   - 智能缓存：相同的构建只执行一次
   - 并行构建：多个项目同时构建
   - 增量构建：只构建变更的部分

2. **代码复用**
   - 共享UI组件库
   - 统一配置管理
   - 版本一致性保证

3. **工作流程**
   - 统一的命令入口
   - 自动化的代码检查
   - 标准化的提交规范

### 开发环境与部署
#### 必须的开发环境和可选工具
- 必需工具:
  - Node.js >= 18
  - Yarn >= 4.9.2

#### 如何搭建开发环境
```bash
# 安装依赖
yarn install
```

#### 构建、部署和运维要求
- 构建命令:
  ```bash
  # 构建所有项目
  yarn build
  
  # 构建特定应用
  yarn build --filter=web
  ```
- 部署命令:
  ```bash
  # 部署特定应用
  部署 apps/web/.next 目录
  ```


### Turbo 启动项目
### 启动项目
```bash
# 启动所有项目
yarn dev

# 启动特定应用
yarn dev --filter=admin
```

## 有用链接

了解更多 Turborepo 的强大功能：

- [任务](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [缓存](https://turborepo.com/docs/crafting-your-repository/caching)
- [远程缓存](https://turborepo.com/docs/core-concepts/remote-caching)
- [过滤](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [配置选项](https://turborepo.com/docs/reference/configuration)
- [CLI 使用](https://turborepo.com/docs/reference/command-line-reference)


### 开发指南补充

1. **子应用开发流程**
   ```bash
   # 创建新的子应用
   yarn turbo gen workspace
   
   # 继承基础配置
   yarn workspace system1 add @repo/admin-ui @repo/utils
   
   # 本地开发
   yarn dev --filter=admin --filter=system1
   ```

2. **常用开发命令**
   ```bash
   # 启动基座和指定子应用
   yarn dev --filter=admin --filter=system1
   
   # 构建特定应用
   yarn build --filter=system1
   
   # 运行测试
   yarn test --filter=system1
   ```

3. **开发注意事项**
   - 遵循统一的状态管理方案
   - 使用共享组件库
   - 保持子应用轻量
   - 注意跨应用通信的性能影响
