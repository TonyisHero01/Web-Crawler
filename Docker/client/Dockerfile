# client/Dockerfile
FROM node:20

# 安装 pnpm
RUN npm install -g pnpm

# 创建工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN pnpm install

# 复制全部代码
COPY . .

# 暴露默认 Vite 端口
EXPOSE 5173

# 默认命令（开发模式）
CMD ["pnpm", "dev"]