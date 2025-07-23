const { GraphQLObjectType, GraphQLSchema } = require('graphql');
const pageQueries = require('./queries/pageQueries');
const websiteRecordQueries = require('./queries/websiteRecordQueries');
const startCrawlMutation = require('./mutations/startCrawlMutation');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    ...pageQueries,
    ...websiteRecordQueries
  }
});

const RootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    ...startCrawlMutation
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation
});