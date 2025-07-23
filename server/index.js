const express = require('express');
const cors = require('cors');
const http = require('http');
const { pool } = require('./config/db');
const schema = require('./graphql/schema');
const websiteRecordsRouter = require('./routes/websiteRecords');
const { graphqlHTTP } = require('express-graphql');
const { jobManager, runPythonCrawler, setNotifyCallback } = require('./crawler/runner');
const { initWebSocket, notifyCrawlComplete } = require('./ws/wsManager');

const app = express();
const server = http.createServer(app);
const port = 3000;

initWebSocket(server);
setNotifyCallback(notifyCrawlComplete);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/website-records', websiteRecordsRouter);

app.post('/api/crawl', async (req, res) => {
  let { mode, depth, pattern, website_record_id, interval_seconds } = req.body;

  if (!website_record_id) return res.status(400).json({ message: 'Missing website_record_id' });

  mode = parseInt(mode);
  depth = parseInt(depth || 1);
  interval_seconds = parseInt(interval_seconds || 60);

  const result = await pool.query('SELECT url FROM website_records WHERE id = $1', [website_record_id]);
  if (result.rowCount === 0) return res.status(404).json({ message: 'Website record not found' });

  const url = result.rows[0].url;
  jobManager.stop(website_record_id);

  if (mode === 0) {
    console.log("🚀 Immediate mode, running once");
    await runPythonCrawler(url, depth, pattern, website_record_id);
  } else {
    console.log("⏱️ Scheduling periodic crawl task...");
    jobManager.schedule(url, depth, pattern, website_record_id, interval_seconds);
  }

  res.json({ message: "Crawler started", mode });
});

app.use('/api/test', (_, res) => res.json({ status: 'ok' }));

app.use('/graphql', graphqlHTTP({ schema, graphiql: true }));

server.listen(port, () => {
  console.log(`🌍 Web crawler app listening at http://localhost:${port}`);
});