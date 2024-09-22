# Web Crawler
This project is a web crawler application based on Python, Node.js, and GraphQL. It can scrape links and their content from specified web pages and store the data in a MongoDB database. The front end uses React and Vite to display the scraped page data and presents the relationships between pages through a graphical interface.

## Table of Contents

- [Web Crawler](#web-crawler)
  - [Table of Contents](#table-of-contents)
    - [Requirements](#requirements)
    - [Features](#features)
    - [Project Architecture](#project-architecture)
    - [Installation and Running](#installation-and-running)
      - [Local running](#local-running)
      - [Run Using Docker Images](#run-using-docker-images)
    - [Usage:](#usage)
    - [Client Features](#client-features)
    - [Server Features](#server-features)
    - [Python Crawler Features](#python-crawler-features)
    - [License](#license)

### Requirements
    •	Linux, Windows, MacOS
    •	[Docker](https://www.docker.com/)
    •	[Docker Compose](https://docs.docker.com/compose/)     

**For building locally**

    •	[Python](https://www.python.org/) 3.9.1rc1
    •	[Node](https://nodejs.org/en) v20.14.0
    •	[React](https://react.dev/) 18.3.1


### Features

	•	Web Crawling: Crawl web pages from a specified URL and automatically fetch internal links.
	•	Data Storage: The crawled page data (URL, title, time, links) is stored in a MongoDB database.
	•	Frontend Display: The React frontend visualizes the page data and their relationships using Relation Graph.
	•	GraphQL Queries: The frontend uses Apollo Client to query data from the backend via GraphQL.

### Project Architecture

    •	Server + Crawler: Node.js, Express, GraphQL, MongoDB, Python, Requests, Pymongo
        - This program crawles webs from the given URL and save it into MongoDB.
        - Implemented by Node + python. Python crawles pages and save into MongoDB. Node reads data from MongoDB and resolve request from client using GraphQL.
	•	Client: React, Vite, Apollo Client, Relation Graph
        - This program reads url data from sever and shows graph in website.    
        - Implemented by React. Using library relation-graph-react to show URL relation graph on the page. 
	
### Installation and Running
#### Local running
**Clone the repository:**
```bash
git clone https://github.com/your-repo/web-crawler.git
```
**Server repository:**
```bash
cd web-crawler/server
```
Install dependencies:
```bash
npm i
```
```bash
pip install -r requirement.txt
```
Configure MongoDB connection:   
•	Update the MongoDB connection URL in server/config.js and server/config.py.
Start the server:
```bash
node index.js
```
**Client repository:**
```bash
cd web-crawler/client
```
Install dependencies:
- Run ```npm i -g pnpm```, ```pnpm i```
- Start development mode: ```npm run dev```, then access: [http://localhost:5173/](http://localhost:5173/)
- Start production mode: ```npm run build``` and ```npm run start```, then access: [http://localhost:4173/](http://localhost:4173/)

#### Run Using Docker Images

You can also run both the client and server using pre-built Docker images from Docker Hub. The images are hosted at:
- [Client Image on Docker Hub](https://hub.docker.com/repository/docker/tonyishero01/nginx/general)
- [Server Image on Docker Hub](https://hub.docker.com/repository/docker/tonyishero01/sc3/general)

**Steps to run:**

  1.	Pull the Docker images from Docker Hub:
  ```bash
  docker pull tonyishero01/nginx
  docker pull tonyishero01/sc3
  ```
  2.	Run the server Docker container:
  ```bash
  docker run -d --name="server-container" -p 4000:4000 tonyishero01/sc3
  ```
  3.	Run the client Docker container:
  ```bash
  docker run -d --name="client-container" -p 3000:3000 tonyishero01/nginx
  ```
If you prefer to build the Docker images locally, you can follow the steps below:   

**Build and Run the Server Docker Image Locally**
  1.	Navigate to the server directory:
  ```bash
  cd server
  ```
  2.	Build the Docker image:
  ```bash
  docker build -t web-crawler-server .
  ```
  3.	Run the Docker container:
  ```bash
  docker run -d -p 4000:4000 web-crawler-server
  ```

**Build and Run the Client Docker Image Locally**

	1.	Navigate to the client directory:
  ```bash
  cd client
  ```
  2.	Build the Docker image:
  ```bash
  docker build -t web-crawler-client .
  ```
  3.	Run the Docker container:
  ```bash
  docker run -d -p 3000:3000 web-crawler-client
  ```



### Usage:
1. In the client application, enter the URL you want to crawl and specify the depth.   
2. Choose the crawler mode:   
	•	Active Mode: Starts crawling immediately. Schedules the crawling task to run periodically.   
	•	Inactive Mode: Shows crawled data(You need after typing new url and depth switch to Active mode and wait for few minutes, then switch to Inactive mode.).
3. If website does not show data graph for long time, please check command line if there is some error.   

### Client Features

	•	URL Input: Allows users to enter the URL to be crawled.
	•	Depth Selection: Allows users to specify the depth of the crawling process.
	•	Graphical Visualization: Displays page nodes and link relationships, with clickable nodes to view detailed information.
	•	Mode Selection: Supports manual and scheduled crawling modes.

### Server Features

	•	GraphQL API: Provides a GraphQL API for querying crawled data.
	•	Scheduled Tasks: Implements scheduled tasks using Node.js’s node-schedule to periodically crawl based on user settings.
	•	Data Management: Uses MongoDB to store and manage the crawled data.

### Python Crawler Features

	•	Web Scraping: Uses the requests library to scrape webpage content.
	•	Link Extraction: Uses regular expressions to extract links from the page.
	•	Data Storage: Stores crawled page information in MongoDB.
	•	Multithreading: Implements multithreaded crawling using _thread to improve crawling efficiency.

### License

MIT License