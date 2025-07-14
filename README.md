# 🌐 Web Crawler

This project is a full-stack web crawler using **Python**, **Node.js**, **PostgreSQL**, and **React**. It crawls web pages, extracts internal links and titles, stores the data in a **PostgreSQL** database, and visualizes the results in a graph interface using **Relation Graph**.

---

## 📦 Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- (Optional for local development)
  - [Python 3.9+](https://www.python.org/)
  - [Node.js v20+](https://nodejs.org/)
  - [pnpm](https://pnpm.io/)
  - [PostgreSQL](https://www.postgresql.org/)

---

## ✨ Features

### ✅ Python Crawler
- Crawl specified URLs to a certain depth.
- Extract `<title>` and all internal links.
- Store data (url, title, time, from_id, links) into PostgreSQL.

### ✅ Backend (Node.js + Express + GraphQL)
- Expose a GraphQL API for querying crawled data.
- Schedule crawl tasks using `node-schedule`.
- Manage page relationships and store executions.

### ✅ Frontend (React + Vite)
- Input crawl target and depth.
- Toggle crawl mode (Active/Inactive).
- Display site structure in an interactive relation graph.

---

## 🏗️ Project Structure
web-crawler/   
├── client/         # React frontend   
├── server/         # Node.js backend + Python crawler   
├── Docker/         # Dockerfiles and compose config   
└── README.md   
---
### 🐳 Using Docker Images

> Images hosted on Docker Hub:

- **Client**: [tonyishero01/nginx](https://hub.docker.com/repository/docker/tonyishero01/nginx/general)
- **Server**: [tonyishero01/sc3](https://hub.docker.com/repository/docker/tonyishero01/sc3/general)

```bash
docker pull tonyishero01/nginx
docker pull tonyishero01/sc3

docker run -d --name="server-container" -p 4000:4000 tonyishero01/sc3
docker run -d --name="client-container" -p 3000:3000 tonyishero01/nginx
```
### 🧑‍💻 Local Development

1. Clone the repository
```bash
git clone https://github.com/your-repo/web-crawler.git
cd web-crawler
```
2. Setup PostgreSQL
	•	Ensure PostgreSQL is running (e.g., localhost:5432)
	•	Create a database named webcrawler
	•	Update .env file with connection info:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webcrawler
DB_USER=your_username
DB_PASS=your_password
```
3. Setup Server
```bash
cd server
npm install
pip install -r requirements.txt
```
Start the backend:
```bash
node index.js
```
4. Setup Client
```bash
cd ../client
pnpm install
pnpm run dev
```
Access the frontend at http://localhost:5173

### 📌 Usage
	1.	Open the frontend and enter the target URL, crawl depth, regex and seconds(If active mode).
	2.	Set crawl mode to Active or Inactive to start crawling.
	3.	After crawling finishes you can see the results.
	4.	Click nodes to inspect page titles, timestamps, and links.

---

#### 🧠 Architecture Summary
	•	Python crawler runs in child process and writes directly to PostgreSQL.    
	•	Express backend triggers crawls, handles periodic jobs, and serves GraphQL data.
	•	React frontend uses Apollo Client to fetch data and renders an interactive graph.

---

#### 🐍 Python Crawler Details
	•	Uses requests, re, psycopg2, and dotenv.
	•	Recursively crawls and inserts pages with execution_id, from_id, etc.
	•	Tracks visited URLs to avoid duplicates.
	•	Errors are caught and fallback records inserted to DB.

---

📄 License

MIT License © 2025 tonyishero01