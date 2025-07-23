const { pool } = require('../config/db');

async function createRecord(data) {
  const { url, label, regexp, periodicity, active, tags = [] } = data;
  const result = await pool.query(
    `INSERT INTO website_records (url, label, regexp, periodicity, active, tags)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [url, label, regexp, periodicity, active, tags]
  );
  return result.rows[0];
}

async function findRecordById(id) {
  const result = await pool.query('SELECT * FROM website_records WHERE id = $1', [id]);
  return result.rows[0] || null;
}

async function listRecords({ url, label, tag, page, pageSize, sortBy, sortDir }) {
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

  const result = await pool.query(query, values);
  return result.rows;
}

async function updateRecord(id, data) {
  const { url, label, regexp, periodicity, active, tags = [] } = data;
  const result = await pool.query(
    `UPDATE website_records SET
       url = $1, label = $2, regexp = $3,
       periodicity = $4, active = $5, tags = $6,
       updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [url, label, regexp, periodicity, active, tags, id]
  );
  return result.rows[0];
}

async function updateActiveFlag(id, active) {
  const result = await pool.query(
    `UPDATE website_records SET active = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [active, id]
  );
  return result.rows[0] || null;
}

async function deleteRecord(id) {
  await pool.query('DELETE FROM website_records WHERE id = $1', [id]);
}

module.exports = {
  createRecord,
  findRecordById,
  listRecords,
  updateRecord,
  updateActiveFlag,
  deleteRecord,
};