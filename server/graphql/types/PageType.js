const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
} = require('graphql');
const { pool } = require('../../config/db');

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
              from_id: row.from_id,
            }
          : null;
      },
    },
  }),
});

module.exports = PageType;