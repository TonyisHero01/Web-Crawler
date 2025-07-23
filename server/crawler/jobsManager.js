// server/crawler/jobsManager.js
const { runPythonCrawler } = require('./pythonCrawler');

const jobs = {};

const jobManager = {
  schedule: (url, depth, pattern, website_record_id, interval_seconds) => {
    const idStr = website_record_id.toString();
    jobManager.stop(idStr);

    const job = setInterval(() => {
      runPythonCrawler(url, depth, pattern, website_record_id);
    }, interval_seconds * 1000);

    jobs[idStr] = job;
    console.log(`📅 Scheduled job for #${idStr}`);
  },

  stop: (website_record_id) => {
    const idStr = website_record_id.toString();
    if (jobs[idStr]) {
      clearInterval(jobs[idStr]);
      delete jobs[idStr];
    }
  },

  clear: () => {
    for (const id in jobs) {
      clearInterval(jobs[id]);
      delete jobs[id];
    }
  },

  list: () => Object.keys(jobs)
};

module.exports = jobManager;