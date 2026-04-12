# 使用自己的镜像
FROM gracelife/grace055

# 设置工作目录
WORKDIR /app

# 拷贝包管理配置文件
COPY package.json yarn.lock turbo.json ./

# 拷贝整个项目（包含 packages 和 apps）
COPY . .

RUN corepack enable && corepack prepare yarn@4.9.2 --activate
# 安装依赖
RUN yarn install --frozen-lockfile

# 使用 Turbo 构建 oms-backend 应用
RUN yarn build:dev --filter=oms-backend

# 设置工作目录为 oms-backend
WORKDIR /app/apps/oms-backend

EXPOSE 3000
# 启动服务（监听 0.0.0.0 端口，方便 Docker 外部访问）
CMD ["yarn", "start:dev","--hostname", "0.0.0.0"]


# # jenkins 构建脚本
# cd /home/wuxiang/oms_web/
# scp -P 56354 deploy.tar.gz wangsheng@172.16.202.2:/home/wuxiang/oms_web
# rm -rf deploy.tar.gz
# ssh -p 56354 wangsheng@172.16.202.2 "
#   cd /home/wuxiang/oms_web &&
#   rm -rf .next public &&      # 删除旧的 oms_web
#   tar -xzf deploy.tar.gz &&   # 解压新上传的 dist.tar.gz
# rm -f deploy.tar.gz &&
# mv .next/static .next/standalone/apps/oms-backend/.next/ &&
# mv public .next/standalone/apps/oms-backend/ &&
# cd standalone/apps/oms-backend &&
# docker run --rm -d \
#   --name oms-backend-app \
#   -p 3000:3000 \
#   -v "$(pwd)/standalone":/standalone \
#   node-22.9 \
#   sh -c "cd /standalone/apps/oms-backend && node server.js"
# "