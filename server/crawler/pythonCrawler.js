// server/crawler/pythonCrawler.js
const path = require('path');
const { spawn } = require('child_process');
const { pool } = require('../config/db');

let notifyCallback = null;

function setNotifyCallback(cb) {
  notifyCallback = cb;
}

async function runPythonCrawler(url, depth, pattern, websiteRecordId) {
  console.log(`[CRAWLER] ▶️ Starting crawl for ${url} (depth: ${depth}, pattern: ${pattern})`);

  const result = await pool.query(
    `INSERT INTO executions (website_record_id) VALUES ($1) RETURNING id`,
    [websiteRecordId]
  );
  const executionId = result.rows[0].id;

  const pythonPath = 'python';
  const scriptPath = path.join(__dirname, '../crawler.py');
  const args = [scriptPath, url, depth.toString(), pattern || '.*', executionId.toString()];
  const py = spawn(pythonPath, args);

  let insertedCount = 0;

  py.stdout.on("data", (data) => {
    const msg = data.toString();
    console.log("[PYTHON OUTPUT]", msg);
    if (msg.startsWith('[INSERTED]')) insertedCount += 1;
  });

  py.stderr.on("data", (data) => {
    console.error("[PYTHON ERROR]", data.toString());
  });

  py.on("close", async () => {
    await pool.query(
      `UPDATE executions SET end_time = CURRENT_TIMESTAMP, crawled_count = $1 WHERE id = $2`,
      [insertedCount, executionId]
    );
    console.log(`[EXECUTION COMPLETE] ID ${executionId} | ${insertedCount} pages`);

    if (notifyCallback) {
      console.log(`📬 Calling notifyCallback for websiteRecordId: ${websiteRecordId}`);
      notifyCallback(websiteRecordId);
    } else {
      console.warn(`⚠️ No notifyCallback registered`);
    }
  });
}

module.exports = { runPythonCrawler, setNotifyCallback };