FROM node:20

RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /venv

RUN /venv/bin/pip install --upgrade pip && \
    /venv/bin/pip install requests beautifulsoup4 python-dotenv psycopg2

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

ENV PATH="/venv/bin:$PATH"

CMD ["node", "index.js"]