const fetch = require('node-fetch');

function triggerCrawl({ id, url, regexp }, mode = 0, interval_seconds = 60, depth = 1) {
  return fetch('http://localhost:3000/api/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode,
      url,
      pattern: regexp,
      website_record_id: id,
      interval_seconds,
      depth,
    })
  });
}

module.exports = { triggerCrawl };