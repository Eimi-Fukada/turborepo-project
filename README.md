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

### 打包部署流程

`next.config.js` 中 `output` 配置项支持两种主要的部署模式：`standalone` 和 `export`。这两种模式适用于完全不同的场景。

---

### 1. `standalone` 模式 (推荐用于动态应用)

此模式会为你的 Next.js 应用创建一个独立的、包含 Node.js 服务器的最小化部署包。它非常适合需要 API、动态渲染、用户登录等功能的复杂应用，并且是 **Docker 部署的最佳选择**。

#### 打包步骤

1.  **修改配置**:
    在 `apps/oms-backend/next.config.js` (或其他需要部署的应用) 中，确保配置如下：
    ```javascript
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      // ...其他配置
      output: 'standalone',
    };
    module.exports = nextConfig;
    ```

2.  **执行构建**:
    在项目根目录运行构建命令：
    ```bash
    yarn build --filter=oms-backend
    ```
    构建成功后，会在 `apps/oms-backend/.next/standalone` 目录下生成一个独立的、可运行的产物。

#### 部署流程 (以 Docker 为例)

1.  **准备部署文件**:
    `standalone` 模式的部署需要两个关键部分：
    *   **构建产物**: 即 `apps/oms-backend/.next/standalone` 目录下的所有内容。
    *   **静态资源**: 即 `apps/oms-backend/public` 目录。

2.  **编写 Dockerfile**:
    在 `apps/oms-backend` 目录下创建一个 `Dockerfile`，内容如下：
    ```dockerfile
    # 使用一个包含 Node.js 的轻量级基础镜像
    FROM gracelife/grace055

    # 设置工作目录
    WORKDIR /app

    # 拷贝独立的构建产物
    # 注意: 构建步骤应在 Docker 外部完成 (例如 CI/CD)
    COPY .next/standalone/ .

    # !! 注意事项: 手动拷贝 public 目录
    # standalone 模式不会自动包含 public 目录，必须手动拷贝
    COPY public ./public

    # 暴露端口
    EXPOSE 3000

    # 启动服务
    CMD ["node", "server.js"]
    ```

3.  **构建并运行 Docker 镜像**:
    在服务器上，将 `standalone` 产物和 `public` 目录组织好后，执行：
    ```bash
    # 构建镜像
    docker build -t oms-backend-app .

    # 运行容器
    docker run -d -p 3001:3000 --name oms-backend-container oms-backend-app
    ```

#### **注意事项**

*   **`public` 目录**: `standalone` 模式**不会**自动打包 `public` 目录，部署时必须手动将其拷贝到和 `standalone` 产物里的 `.next` 文件夹同级的目录下。
*   **环境变量**: 如果应用依赖环境变量 (`.env` 文件)，请确保在运行容器时通过 `-e` 参数或 Docker Compose 的 `environment` 配置传入。
*   **Monorepo 结构**: `standalone` 模式会自动处理 `packages` 内部包的依赖，无需担心。
*   **不依赖于Dockerfile文件**: 首先将.next中的static文件夹移动到standalone文件夹下，保证其在里面的.next文件夹里面，同时将项目中的public文件夹移动到standalone文件夹下，保证其和里面的.next文件夹同级。然后就可以使用Docker运行node server.js来运行容器了，具体命令如下
```bash
docker run --rm -d \
  --name oms-backend-app \
  -p 3000:3000 \
  -v "$(pwd)/standalone":/standalone \
  node-22.9 \
  sh -c "cd /standalone/apps/oms-backend && node server.js"
```

---

### 2. `export` 模式 (仅限静态网站)

此模式会将你的应用导出为纯 HTML/CSS/JS 静态文件，可以部署在任何静态文件服务器上（如 Nginx, GitHub Pages），**完全不需要 Node.js 环境**。

#### 打包步骤

1.  **修改配置**:
    在 `next.config.js` 中配置如下：
    ```javascript
    /** @type {import('next').NextConfig} */
    const nextConfig = {
      // ...其他配置
      output: 'export',
    };
    module.exports = nextConfig;
    ```

2.  **执行构建**:
    ```bash
    yarn build --filter=oms-backend
    ```
    构建成功后，所有静态文件会生成在 `apps/oms-backend/out` 目录下。

#### 部署流程 (以 Nginx 为例)

1.  **上传产物**:
    将 `apps/oms-backend/out` 目录下的所有文件上传到你的 Web 服务器（例如 `/var/www/my-static-site`）。

2.  **配置 Nginx**:
    ```nginx
    server {
        listen 80;
        server_name your-domain.com;

        root /var/www/my-static-site;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

#### **注意事项**

*   **功能限制**: `export` 模式**不支持**任何需要服务器运行时的功能，包括 API 路由 (Route Handlers)、动态渲染、中间件 (`middleware.js`)、重定向等。
*   **本地预览**: 导出的文件不能直接通过 `file://` 协议在浏览器打开。你需要在 `out` 目录下运行一个本地服务器来预览，例如：
    ```bash
    npx serve out
    ```


#### Docker镜像问题
* 如果拉取不到官方镜像，可以找个Docker镜像源，然后拉取下来
* 在本地运行 docker images 查看镜像
* 运行 docker save gracelife/grace055 > grace055.tar 打成一个tar包
* 上传到服务器某一个路劲下
* 运行 docker load -i gracelife/grace055.tar 加载镜像
* 就可以运行 docker run --rm -d \
  --name oms-backend-app \
  -p 3000:3000 \
  -v "$(pwd)/standalone":/standalone \
  gracelife/grace055 \
  sh -c "cd /standalone/apps/oms-backend && node server.js"

  ### 修改Linux文件夹权限
  sudo chown -R wangsheng:developers oms_web


### Jenkins 配置示例
* 执行shell 
```
yarn install --registry https://registry.npmmirror.com/
yarn build:dev --filter=$projectName
cd apps/$projectName
mv .next/static .next/standalone/apps/oms-backend/.next/
mv public .next/standalone/apps/oms-backend/
tar -zcf deploy.tar.gz .next
```
* Exec command
```
cd /home/wuxiang/oms_web/
scp -P 56354 deploy.tar.gz wangsheng@172.16.202.2:/home/wuxiang/oms_web

ssh -p 56354 wangsheng@172.16.202.2 "
  cd /home/wuxiang/oms_web &&
  rm -rf .next &&
  tar -xzf deploy.tar.gz &&
rm -f deploy.tar.gz &&
cd .next/ &&
docker rm -f oms-backend-app || true &&
docker run --rm -d \
  --name oms-backend-app \
  -p 3000:3000 \
  -v "$(pwd)/standalone":/standalone \
  node-22.9 \
  sh -c "cd /standalone/apps/oms-backend && node server.js"
```

* 解释代码：
```
1️⃣ docker rm -f oms-backend-app || true
作用：
强制删除一个叫 oms-backend-app 的容器（如果它存在）
-f：强制删除，即使容器正在运行
|| true：即使没有这个容器（删除失败），也不报错，继续执行后面的命令
🎯 目的：确保不会因为“容器已存在”而报错。

2️⃣ docker run
这是 Docker 的核心命令，用来创建并启动一个新容器。

3️⃣ --rm
作用：
当容器停止运行时，自动删除容器
避免产生“僵尸容器”占用空间
📌 注意：--rm 和你前面的 docker rm -f 看似重复，其实是配合使用的：

docker rm -f：删除旧的容器
--rm：让新的容器在停止时自动删除
4️⃣ -d
作用：
后台运行容器（detached 模式）
容器启动后，不占用终端，可以继续执行其他命令
5️⃣ --name oms-backend-app
作用：
给这个容器起个名字：oms-backend-app
后续可以用这个名字管理容器，比如：
bash
深色版本
docker stop oms-backend-app
docker restart oms-backend-app
docker logs oms-backend-app
6️⃣ -p 3000:3000
作用：
端口映射（Port Mapping）
把宿主机（服务器）的 3000 端口，映射到容器内的 3000 端口
📌 解释：

你的 Node.js 服务在容器里监听 3000 端口
外部用户通过 http://服务器IP:3000 访问
Docker 把请求从宿主机的 3000 转发到容器的 3000
🔥 7️⃣ -v "$(pwd)/standalone":/standalone ← 这就是“挂载”！
这是整个命令中最关键的部分 —— 挂载（Volume Mount）
拆解：
bash
深色版本
-v "宿主机路径:容器内路径"
具体是：

宿主机路径："$(pwd)/standalone"
$(pwd)：当前目录（比如 /home/wuxiang/oms_web/.next）
所以完整路径是：/home/wuxiang/oms_web/.next/standalone
容器内路径：/standalone
容器内部的一个目录
✅ 挂载的作用：
把宿主机上的 ./standalone 文件夹，“映射”到容器内的 /standalone 文件夹

📌 效果：

容器内读写 /standalone，实际上是在操作宿主机的 ./standalone
宿主机上更新了 ./standalone 里的文件，容器内立刻就能看到！
🎯 这就是你实现“代码更新”的关键！

8️⃣ node-22.9
作用：
指定使用哪个 镜像（Image） 来创建容器
这个镜像是你自定义的 Node.js 22.9 环境
📌 镜像可以理解为“软件安装包”，容器是“运行中的实例”

9️⃣ sh -c "cd /standalone/apps/oms-backend && node server.js"
作用：
容器启动后，要运行的命令
sh -c：用 shell 执行后面的命令
具体执行：
cd /standalone/apps/oms-backend
→ 进入挂载目录下的项目文件夹
node server.js
→ 启动 Node.js 服务
📌 因为 /standalone 是挂载的，所以 server.js 是你从外面传进来的代码！
```

* 可优化点：
上面的逻辑都是停止并删除容器，然后重新启动，这样每次部署都需要停掉容器，然后重新启动，效率不高。
可以执行以下命令：
```
ssh -p 56354 wangsheng@172.16.202.2 "
  cd /home/wuxiang/oms_web &&
  tar -xzf deploy.tar.gz &&
  if docker ps -a --format '{{.Names}}' | grep -q '^oms-backend-app\$'; then
    echo '🔄 容器已存在，正在重启...'
    docker restart oms-backend-app
  else
    echo '🆕 容器不存在，正在创建...'
    docker run --rm -d \
      --name oms-backend-app \
      -p 3000:3000 \
      -v /home/wuxiang/oms_web/standalone:/standalone \
      node-22.9 \
      sh -c 'cd /standalone/apps/oms-backend && node server.js'
  fi
"
```


