const express = require('express');
const cors = require('cors');
const path = require('path');
const { pool } = require('./db/conn');
const schema = require('./graphql/schema');
const websiteRecordsRouter = require('./routes/websiteRecords');
const { graphqlHTTP } = require('express-graphql');

// ✅ 引入爬虫任务管理器和执行函数
const { jobManager, runPythonCrawler } = require('./crawler/runner');

const app = express();
const port = 3000;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// REST 路由（兼容）
app.use('/api/website-records', websiteRecordsRouter);

/**
 * 接收配置并触发爬虫任务（REST 方式）
 */
app.post('/api/crawl', async (req, res) => {
  let { mode, depth, pattern, website_record_id, interval_seconds } = req.body;

  if (!website_record_id) {
    return res.status(400).json({ message: 'Missing website_record_id' });
  }

  mode = parseInt(mode);
  depth = parseInt(depth || 1);
  interval_seconds = parseInt(interval_seconds || 60);

  const result = await pool.query(
    'SELECT url FROM website_records WHERE id = $1',
    [website_record_id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ message: 'Website record not found' });
  }

  const url = result.rows[0].url;

  // ✅ 改为只清除当前任务
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

app.post('/api/test', (req, res) => {
  res.json({ status: 'ok' });
});

// ✅ GraphQL 接口（用于 startCrawl mutation）
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

// 启动服务
app.listen(port, () => {
  console.log(`Web crawler app listening at http://localhost:${port}`);
});