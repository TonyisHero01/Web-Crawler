const path = require('path');
const { spawn } = require('child_process');
const { pool } = require('../db/conn');

const jobs = {};

const jobManager = {
  /**
   * 启动定时爬虫任务（定时执行 runPythonCrawler）
   */
  schedule: (url, depth, pattern, website_record_id, interval_seconds) => {
    const idStr = website_record_id.toString();
    jobManager.stop(idStr); // 先停止旧的任务（确保唯一）

    const job = setInterval(() => {
      runPythonCrawler(url, depth, pattern, website_record_id);
    }, interval_seconds * 1000);

    jobs[idStr] = job;
    console.log(`📅 Scheduled job for #${idStr}`);
  },

  /**
   * 停止指定任务
   */
  stop: (website_record_id) => {
    const idStr = website_record_id.toString();
    if (jobs[idStr]) {
      clearInterval(jobs[idStr]);
      delete jobs[idStr];
      console.log(`🛑 Stopped job for #${idStr}`);
    }
  },

  /**
   * 清除所有任务
   */
  clear: () => {
    for (let id in jobs) {
      clearInterval(jobs[id]);
      console.log(`🧹 Cleared job for #${id}`);
    }
    Object.keys(jobs).forEach(id => delete jobs[id]);
  },

  /**
   * 查看当前所有活跃任务（可选扩展）
   */
  list: () => {
    return Object.keys(jobs);
  }
};


/**
 * 真正调用 Python 脚本执行爬虫任务
 */
async function runPythonCrawler(url, depth, pattern, websiteRecordId) {
  console.log(`[CRAWLER] ▶️ Starting crawl for ${url} (depth: ${depth}, pattern: ${pattern})`);

  const result = await pool.query(
    `INSERT INTO executions (website_record_id) VALUES ($1) RETURNING id`,
    [websiteRecordId]
  );
  const executionId = result.rows[0].id;

  const pythonPath = 'python'; // 或 'python3'
  const scriptPath = path.join(__dirname, '../crawler.py');
  const args = [scriptPath, url, depth.toString(), pattern || '.*', executionId.toString()];
  const py = spawn(pythonPath, args);

  let insertedCount = 0;

  py.stdout.on("data", (data) => {
    console.log("[PYTHON OUTPUT]", data.toString());
    if (data.toString().startsWith('[INSERTED]')) {
      insertedCount += 1;
    }
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
  });
}

module.exports = { jobManager, runPythonCrawler };