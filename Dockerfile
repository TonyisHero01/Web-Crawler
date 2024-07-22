# 使用官方的 Node.js 镜像作为基础镜像
FROM node:latest AS frontend

# 设置工作目录为前端项目目录
WORKDIR /app

# 拷贝前端项目的依赖文件到工作目录
COPY graphql-playlist/client/package.json ./
COPY graphql-playlist/client/package-lock.json ./

# 安装前端依赖
RUN npm install

# 拷贝所有前端项目文件到工作目录
COPY graphql-playlist/client .

# 设置环境变量，根据需要调整
ENV REACT_APP_MODE inactive

# 启动前端应用（此处假设启动命令是 npm start）
CMD ["npm", "start"]

# 使用官方的 Python 镜像作为基础镜像
FROM python:3.9 AS backend

# 设置工作目录为后端项目目录
WORKDIR /graphql-playlist

# 拷贝后端项目的依赖文件到工作目录
COPY requirements.txt ./

# 安装 Python 依赖
RUN pip install -r requirements.txt

# 拷贝所有后端项目文件到工作目录
COPY ./ .

# 启动 Python 脚本（根据参数选择启动模式）
CMD ["python", "Crawler.py", "--active"]
