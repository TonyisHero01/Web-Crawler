const {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLList
} = require('graphql');

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

module.exports = WebsiteRecordType;