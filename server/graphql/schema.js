const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLBoolean
} = require('graphql');
const { pool } = require('../db/conn');
const { runPythonCrawler, jobManager } = require('../crawler/runner'); // 👈 你需要创建 runner.js 文件，见后文

// ========== 类型定义 ==========

const WebsiteRecordType = new GraphQLObjectType({
  name: 'WebsiteRecord',
  fields: () => ({
    id: { type: GraphQLID },
    url: { type: GraphQLString },
    label: { type: GraphQLString },
    regexp: { type: GraphQLString },
    periodicity: { type: GraphQLString },
    active: { type: GraphQLString },
    tags: { type: new GraphQLList(GraphQLString) }
  })
});

const PageType = new GraphQLObjectType({
  name: 'Page',
  fields: () => ({
    _id: { type: GraphQLID },
    url: { type: GraphQLString },
    title: { type: GraphQLString },
    time: { type: GraphQLString },
    links: { type: new GraphQLList(GraphQLString) },
    from_id: { type: GraphQLInt },
    from: {
      type: PageType,
      async resolve(parent) {
        if (!parent.from_id) return null;
        const result = await pool.query('SELECT * FROM pages WHERE id = $1 LIMIT 1', [parent.from_id]);
        const row = result.rows[0];
        return row
          ? {
              _id: row.id.toString(),
              url: row.url,
              title: row.title,
              time: row.time.toISOString(),
              links: row.links,
              from_id: row.from_id
            }
          : null;
      }
    }
  })
});

// ========== 查询 ==========

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    pages: {
      type: new GraphQLList(PageType),
      args: {
        website_record_id: { type: GraphQLID }
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
      }
    },

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
          tags: row.tags || []
        }));
      }
    }
  }
});

// ========== Mutation ==========

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    startCrawl: {
      type: GraphQLBoolean,
      args: {
        websiteRecordId: { type: GraphQLInt },
        depth: { type: GraphQLInt },
        pattern: { type: GraphQLString }
      },
      async resolve(_, { websiteRecordId, depth, pattern }) {
        const result = await pool.query(
          'SELECT url FROM website_records WHERE id = $1',
          [websiteRecordId]
        );
        if (result.rowCount === 0) {
          throw new Error("WebsiteRecord not found");
        }

        const url = result.rows[0].url;
        jobManager.clear();
        await runPythonCrawler(url, depth || 2, pattern || '.*', websiteRecordId);
        return true;
      }
    }
  }
});

// ========== 导出 Schema ==========

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});