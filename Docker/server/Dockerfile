FROM node:20

# 安装 Python3 + venv + pip
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /venv

# 激活虚拟环境并安装依赖
RUN /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install requests beautifulsoup4 python-dotenv psycopg2

# 设置工作目录
WORKDIR /usr/src/app

# 拷贝 package.json 并安装 Node.js 依赖
COPY package*.json ./
RUN npm install --legacy-peer-deps

# 拷贝项目源码
COPY . .

# 设置环境变量：默认使用虚拟环境的 Python
ENV PATH="/venv/bin:$PATH"

# 启动 Node.js 服务
CMD ["node", "index.js"]