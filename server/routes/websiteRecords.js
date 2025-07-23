const express = require('express');
const router = express.Router();

const {
  createRecord,
  findRecordById,
  listRecords,
  updateRecord,
  updateActiveFlag,
  deleteRecord
} = require('../services/websiteRecordsService');

const { jobManager } = require('../crawler/runner');
const { triggerCrawl } = require('../utils/crawlerTrigger');

// Create
router.post('/', async (req, res) => {
  try {
    const created = await createRecord(req.body);
    await triggerCrawl(created, 0, req.body.interval_seconds, req.body.depth);
    res.status(201).json(created);
  } catch (err) {
    console.error('[CREATE ERROR]', err);
    res.status(500).json({ message: 'Error creating record' });
  }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const record = await findRecordById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    console.error('[GET ONE ERROR]', err);
    res.status(500).json({ message: 'Error fetching record' });
  }
});

// List
router.get('/', async (req, res) => {
  const {
    url, label, tag,
    page = 1, pageSize = 10,
    sortBy = 'url', sortDir = 'asc'
  } = req.query;

  try {
    const records = await listRecords({
      url, label, tag,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sortBy, sortDir
    });
    res.json(records);
  } catch (err) {
    console.error('[LIST ERROR]', err);
    res.status(500).json({ message: 'Error fetching records' });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const updated = await updateRecord(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('[UPDATE ERROR]', err);
    res.status(500).json({ message: 'Error updating record' });
  }
});

// Patch active
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const active = req.body.active === true || req.body.active === 'true';

  try {
    const updated = await updateActiveFlag(id, active);
    if (!updated) return res.status(404).json({ message: 'Record not found' });

    if (active) {
      await triggerCrawl(updated, 1, req.body.interval_seconds, req.body.depth);
      console.log("🕷️ Patch: Triggered crawling for record", id);
    } else {
      jobManager.stop(id);
    }

    res.json(updated);
  } catch (err) {
    console.error('[PATCH ERROR]', err);
    res.status(500).json({ message: 'Error updating active flag' });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    await deleteRecord(req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('[DELETE ERROR]', err);
    res.status(500).json({ message: 'Error deleting record' });
  }
});

module.exports = router;