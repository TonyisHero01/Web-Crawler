# Client - Web Crawler Frontend

## Introduction
This is the frontend part of the Web Crawler project. It is built using [**React**](https://react.dev/) and [**Vite**](https://vitejs.dev/), and uses [**Apollo Client**](https://www.apollographql.com/docs/) to communicate with the backend's GraphQL API. The client provides a user interface for configuring and visualizing the web crawler data, including a graphical representation of page relationships.

## Features
- **Graphical Representation**: Visualizes the crawled web pages and their relationships using the [relation-graph-react](https://www.relation-graph.com/#/index) library.
- **User Input**: Allows users to input a URL and specify the crawling depth.
- **Mode Selection**: Users can switch between manual and scheduled crawling modes.
- **GraphQL Integration**: Uses Apollo Client to fetch data from the backend's GraphQL API.

## Project Structure
/client   
├── public/               # Public assets like images and icons   
│   └── vite.svg          # Vite logo   
├── src/                  # Main source folder for React components   
│   ├── App.jsx           # Main React component for the app   
│   ├── main.jsx          # Entry point for the React app   
│   └── index.css         # Global styles for the app   
├── assets/               # Additional static assets like images   
│   └── react.svg         # React logo   
├── index.html            # HTML template for the React app   
├── package.json          # Project dependencies and scripts   
├── pnpm-lock.yaml        # Lockfile for pnpm package manager   
├── vite.config.js        # Vite configuration file   
├── .gitignore            # Git ignore file for excluding files from the repository   
└── eslint.config.js      # ESLint configuration for linting the project   

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-repo/web-crawler.git
   cd web-crawler/client
2.	Install dependencies:
    ```bash
    npm i
3.	Start the development server:
    ```bash
    npm run dev
4.	Build for production:
    ```bash
    npm run build
5. To preview the production build:
    ```bash
    npm run start
    ```
    Then access: http://localhost:4173/
## Usage:
1. In the client application, enter the URL you want to crawl and specify the depth.   
2. Choose the crawler mode:   
	•	Active Mode: Starts crawling immediately. Schedules the crawling task to run periodically.   
	•	Inactive Mode: Shows crawled data(You need after typing new url and depth switch to Active mode and wait for few minutes, then switch to Inactive mode.).
3. If website does not show data graph for long time, please check command line if there is some error.   

## License

MIT License