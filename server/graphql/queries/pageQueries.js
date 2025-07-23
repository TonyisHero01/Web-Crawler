const { GraphQLList, GraphQLID } = require('graphql');
const PageType = require('../types/PageType');
const { pool } = require('../../config/db');

const pageQueries = {
  pages: {
    type: new GraphQLList(PageType),
    args: {
      website_record_id: { type: GraphQLID },
    },
    async resolve(_, args) {
      const { website_record_id } = args;
      if (!website_record_id) return [];

      const execRes = await pool.query(
        `SELECT id FROM executions 
         WHERE website_record_id = $1 AND end_time IS NOT NULL 
         ORDER BY id DESC LIMIT 1`,
        [website_record_id]
      );
      if (execRes.rowCount === 0) return [];

      const executionId = execRes.rows[0].id;
      const result = await pool.query(
        'SELECT * FROM pages WHERE execution_id = $1 ORDER BY id',
        [executionId]
      );

      return result.rows.map(row => ({
        _id: row.id.toString(),
        url: row.url,
        title: row.title,
        time: row.time.toISOString(),
        links: row.links,
        from_id: row.from_id
      }));
    },
  },
};

module.exports = pageQueries;