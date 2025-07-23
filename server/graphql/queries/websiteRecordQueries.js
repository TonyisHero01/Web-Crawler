const { GraphQLList } = require('graphql');
const WebsiteRecordType = require('../types/WebsiteRecordType');
const { pool } = require('../../config/db');

const websiteRecordQueries = {
  website_records: {
    type: new GraphQLList(WebsiteRecordType),
    async resolve() {
      const result = await pool.query('SELECT * FROM website_records ORDER BY id DESC');
      return result.rows.map(row => ({
        id: row.id.toString(),
        url: row.url,
        label: row.label,
        regexp: row.regexp,
        periodicity: row.periodicity,
        active: row.active,
        tags: row.tags || [],
      }));
    },
  },
};

module.exports = websiteRecordQueries;