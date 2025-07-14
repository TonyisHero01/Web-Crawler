// routes/websiteRecords.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db/conn');
const fetch = require('node-fetch'); // 👈 添加这一行用于触发爬虫
const { jobManager } = require('../crawler/runner');

// Create Website Record
router.post('/', async (req, res) => {
  const { url, label, regexp, periodicity, active, tags } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO website_records (url, label, regexp, periodicity, active, tags)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [url, label, regexp, periodicity, active, tags || []]
    );

    const newRecord = result.rows[0];

    // ✅ 自动触发爬虫（调用自己的 /api/crawl 接口）
    await fetch('http://localhost:3000/api/crawl', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode: 0,
        url: newRecord.url,
        pattern: newRecord.regexp,
        website_record_id: newRecord.id,
        interval_seconds: req.body.interval_seconds || 60,
        depth: req.body.depth || 1,
      })
    });

    res.status(201).json(newRecord);
  } catch (err) {
    console.error('[CREATE ERROR]', err);
    res.status(500).json({ message: 'Error creating record' });
  }
});

// ✅ 获取单个记录（补上这个）
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM website_records WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('[GET ONE ERROR]', err);
    res.status(500).json({ message: 'Error fetching record' });
  }
});

// Read + filter + pagination + sorting
router.get('/', async (req, res) => {
  const { page = 1, pageSize = 10, url, label, tag, sortBy = 'url', sortDir = 'asc' } = req.query;
  const offset = (page - 1) * pageSize;

  let conditions = [];
  let values = [];

  if (url) {
    values.push(`%${url}%`);
    conditions.push(`url ILIKE $${values.length}`);
  }
  if (label) {
    values.push(`%${label}%`);
    conditions.push(`label ILIKE $${values.length}`);
  }
  if (tag) {
    values.push(tag);
    conditions.push(`$${values.length} = ANY(tags)`);
  }

  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const query = `
    SELECT * FROM website_records
    ${where}
    ORDER BY ${sortBy} ${sortDir === 'desc' ? 'DESC' : 'ASC'}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;

  values.push(pageSize);
  values.push(offset);

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('[LIST ERROR]', err);
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// Update Website Record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { url, label, regexp, periodicity, active, tags } = req.body;
  try {
    const result = await pool.query(
      `UPDATE website_records SET
         url = $1,
         label = $2,
         regexp = $3,
         periodicity = $4,
         active = $5,
         tags = $6,
         updated_at = NOW()
       WHERE id = $7 RETURNING *`,
      [url, label, regexp, periodicity, active, tags || [], id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[UPDATE ERROR]', err);
    res.status(500).json({ message: 'Error updating record' });
  }
});

// Delete Website Record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM website_records WHERE id = $1', [id]);
    res.status(204).end();
  } catch (err) {
    console.error('[DELETE ERROR]', err);
    res.status(500).json({ message: 'Error deleting record' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const rawActive = req.body.active;
  const active = rawActive === true || rawActive === 'true';

  try {
    const result = await pool.query(
      `UPDATE website_records SET active = $1, updated_at = NOW()
       WHERE id = $2 RETURNING *`,
      [active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const updated = result.rows[0];

    if (active === true) {
      await fetch('http://localhost:3000/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 1,
          url: updated.url,
          pattern: updated.regexp,
          website_record_id: updated.id,
          interval_seconds: req.body.interval_seconds || 60,
          depth: req.body.depth || 1,
        })
      });
      console.log("🕷️ Patch: Triggered crawling for record", id);
    }
    else {
      jobManager.stop(id);
    }

    res.json(updated);
  } catch (err) {
    console.error('[PATCH ERROR]', err);
    res.status(500).json({ message: 'Error updating active field' });
  }
});

module.exports = router;
