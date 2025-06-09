## 注意事项
Turborepo 本质上是一个用于优化 monorepo（单仓多模块）工作流的工具，是在一个单一的仓库中集中管理所有项目的构建、测试和发布流程，简化了配置和维护的工作量，可以在多个项目之间共享通用的组件或库，避免了重复造轮子的情况。
但是假如你在apps里面的子模块变成了Git Submodules，那么你得子模块就是一个独立的Git仓库，本质上是一个指向另外一个Git仓库的链接，所以没法引用到共享代码。

## 添加 Git Submodules 的方式
1. 创建一个独立的Git仓库
2. 在本项目中运行 git submodule add <your-docs-repo-url> apps/web ,通过这种方式添加一个git submodules

## 项目架构

此项目使用 Turborepo 构建，采用 monorepo + 微前端架构，通过统一的后台管理框架支持多个业务系统的快速开发和统一管理。

### 核心特性

1. **微前端架构**
   - 基于 Module Federation 实现应用解耦
   - 支持子应用独立开发、部署
   - 统一的运行时沙箱环境
   - 全局状态管理和应用间通信

2. **统一后台框架**
   - 集中式认证和权限管理
   - 可复用的基础UI组件
   - 统一的路由系统
   - 主题定制能力
   - 统一的数据请求层

### 项目结构

```
apps/
  ├── admin/         # 统一后台管理框架 (基座应用)
  │   ├── core/     # 核心功能模块
  │   ├── layouts/  # 布局组件
  │   └── auth/     # 认证与授权
  ├── system1/      # 业务子应用1
  ├── system2/      # 业务子应用2
  ├── docs/         # 文档站点
  └── web/          # 门户网站
packages/
  ├── ui/           # 共享UI组件库
  ├── admin-ui/     # 后台专用组件库
  ├── hooks/        # 通用业务钩子
  ├── utils/        # 工具函数库
  ├── eslint-config/    # ESLint 配置
  ├── typescript-config/ # TypeScript 配置
  └── prettier-config/   # Prettier 配置
```

### 技术栈

- **框架**: Next.js
- **语言**: TypeScript
- **构建工具**: Turborepo
- **包管理**: Yarn Workspaces
- **代码规范**: ESLint + Prettier
- **Git提交**: Commitlint + Husky

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

### 开发指南

1. **环境准备**
   ```bash
   node >= 18
   yarn >= 4.9.2
   ```

2. **安装依赖**
   ```bash
   yarn install
   ```

3. **开发命令**
   ```bash
   # 启动所有项目
   yarn dev
   
   # 只启动特定项目
   yarn dev --filter=web
   yarn dev --filter=docs
   
   # 构建所有项目
   yarn build
   
   # 代码检查
   yarn lint
   
   # 代码格式化
   yarn format
   ```

4. **提交代码**
   提交信息必须符合 Conventional Commits 规范：
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve some bug"
   git commit -m "docs: update readme"
   ```

### 部署流程

1. **构建项目**
   ```bash
   yarn build
   ```

2. **部署选项**

   - **手动部署**
     ```bash
     # 构建特定应用
     yarn build --filter=web
     
     # 部署构建产物
     部署 apps/web/.next 目录
     ```

### 性能优化

1. **优化构建**
   - 使用 `--filter` 只构建需要的包
   - 利用 `turbo.json` 配置缓存策略
   - 合理设置依赖关系

## 有用链接

了解更多 Turborepo 的强大功能：

- [任务](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [缓存](https://turborepo.com/docs/crafting-your-repository/caching)
- [远程缓存](https://turborepo.com/docs/core-concepts/remote-caching)
- [过滤](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [配置选项](https://turborepo.com/docs/reference/configuration)
- [CLI 使用](https://turborepo.com/docs/reference/command-line-reference)

### 微前端架构详解

1. **应用结构**
   - **基座应用** (`apps/admin/`)
     - 提供统一的登录认证
     - 全局状态管理
     - 公共布局组件
     - 权限控制系统
   
   - **子应用**
     - 独立开发和部署
     - 共享基座应用的登录状态
     - 继承基础布局和主题
     - 可以独立扩展专属功能

2. **模块联邦配置**
   ```javascript
   // apps/admin/next.config.js
   const withTM = require('next-transpile-modules')(['@repo/ui', '@repo/admin-ui']);
   
   module.exports = withTM({
     webpack: (config, options) => {
       config.plugins.push(new ModuleFederationPlugin({
         name: 'admin',
         filename: 'remoteEntry.js',
         exposes: {
           './layout': './layouts/AdminLayout',
           './auth': './core/auth',
         },
         shared: ['react', 'react-dom']
       }));
       return config;
     }
   });
   ```

3. **子应用接入指南**
   ```javascript
   // 子应用配置示例
   module.exports = {
     webpack: (config) => {
       config.plugins.push(new ModuleFederationPlugin({
         name: 'system1',
         filename: 'remoteEntry.js',
         remotes: {
           admin: 'admin@http://localhost:3000/remoteEntry.js',
         }
       }));
       return config;
     }
   };
   ```

### 后台管理框架

1. **核心功能**
   - 统一的用户认证
   - 动态路由管理
   - 权限控制系统
   - 主题定制
   - 全局状态管理
   - 统一的错误处理

2. **组件复用**
   - 基础布局组件
   - 通用表单组件
   - 高级表格组件
   - 状态管理工具
   - 业务通用组件

3. **开发规范**
   - 统一的接口规范
   - 标准化的错误处理
   - 主题和样式规范
   - 组件开发规范

### 部署架构

1. **环境配置**
   ```bash
   # 开发环境
   .env.development
   # 测试环境
   .env.test
   # 生产环境
   .env.production
   ```

2. **部署流程**
   ```bash
   # 1. 构建基座应用
   yarn build --filter=admin
   
   # 2. 构建子应用
   yarn build --filter=system1
   
   # 3. 部署顺序
   - 先部署基座应用
   - 再部署子应用
   - 更新 nginx 配置
   ```

3. **Nginx 配置示例**
   ```nginx
   # 基座应用
   location / {
     proxy_pass http://localhost:3000;
   }
   
   # 子应用
   location /system1 {
     proxy_pass http://localhost:3001;
   }
   ```

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
