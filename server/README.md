# Server - Web Crawler Backend

## Introduction
This is the backend part of the Web Crawler project. It handles the scheduling, data management, and GraphQL API used to fetch the crawled data. The backend is built with [**Node.js**](https://nodejs.org/en), [**Express**](https://expressjs.com/), and [**MongoDB**](https://www.mongodb.com). It also interfaces with the [**Python**](https://www.python.org/) crawler to store the scraped data into MongoDB.

## Features
- **GraphQL API**: Provides a flexible interface to query and retrieve crawled data.
- **Scheduled Crawling**: Uses `node-schedule` to periodically run the crawler based on user input.
- **Data Storage**: Stores crawled data, including URLs, page titles, and links, in a MongoDB database.
- **Integration with Python Crawler**: Receives crawled data from the Python script and saves it into MongoDB.

## Project Structure
/server   
├── db/                    # Database configuration and connection   
│   ├── conn.js            # MongoDB connection setup   
├── config.js              # Configuration file for MongoDB connection in Node.js   
├── config.py              # Configuration file for MongoDB connection in Python crawler   
├── crawler.py             # Python web crawler script   
├── index.js               # Main Node.js server file (Express server)   
├── package.json           # Project dependencies and scripts for Node.js server   
├── pnpm-lock.yaml         # Lockfile for pnpm package manager   
└── requirement.txt        # Python dependencies for the crawler   

## Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/your-repo/web-crawler.git
    cd web-crawler/server
2.	Install Node.js dependencies:
    ```bash
    npm i
3. Install Python dependencies (for Python integration):
   ```bash
   pip install -r requirements.txt
4.	Configure MongoDB:   
Update the MongoDB connection URL in db/conn.js and config.py to point to your MongoDB instance.
## Running the Server
1.	Start the Node.js server:
    ```bash
    node index.js
## License

MIT License