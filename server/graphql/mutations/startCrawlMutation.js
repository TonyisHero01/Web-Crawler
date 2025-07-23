const { GraphQLBoolean, GraphQLInt, GraphQLString } = require('graphql');
const { pool } = require('../../config/db');
const { runPythonCrawler, jobManager } = require('../../crawler/runner');

const startCrawlMutation = {
  startCrawl: {
    type: GraphQLBoolean,
    args: {
      websiteRecordId: { type: GraphQLInt },
      depth: { type: GraphQLInt },
      pattern: { type: GraphQLString },
    },
    async resolve(_, { websiteRecordId, depth, pattern }) {
      const result = await pool.query(
        'SELECT url FROM website_records WHERE id = $1',
        [websiteRecordId]
      );
      if (result.rowCount === 0) {
        throw new Error('WebsiteRecord not found');
      }

      const url = result.rows[0].url;
      jobManager.clear();
      await runPythonCrawler(url, depth || 2, pattern || '.*', websiteRecordId);
      return true;
    },
  },
};

module.exports = startCrawlMutation;