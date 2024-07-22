const graphql = require('graphql');
const _ = require('lodash');

const { GraphQLDateTime } = require('graphql-iso-date');


const Book = require('../models/book');
const Author = require('../models/author');
const Page = require('../models/page');
const Outgoing_link = require('../models/outgoingLink');
const { 
    GraphQLObjectType, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
} = graphql;
// 定义 Book 类型
const BookType = new GraphQLObjectType({
    name: 'Book',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre: { type: GraphQLString },
        author: {
            type: AuthorType,
            resolve(parent, args) {
                console.log(parent);
                //return _.find(authors, {id: parent.authorid});
                return Author.findById(parent.authorId);
            }
        }
    })
});

// 定义 Author 类型
const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                //return _.filter(books, {authorid: parent.id});
                return Book.find({authorId: parent.id});
            }
        }
    })
});

// 定义 Page 类型
const PageType = new GraphQLObjectType({
    name: 'Page',
    fields: () => ({
        id: { type: GraphQLID },
        url: { type: GraphQLString },
        title: { type: GraphQLString },
        time: { type: GraphQLDateTime },
        outgoing_links: {
            type: new GraphQLList(OutgoingLinkType),
            resolve(parent, args) {
                //return _.filter(outgoing_links, {from_id: parent.id});
                return Outgoing_link.find({from_id: parent.id});
            }
        }
    })
});

// 定义 OutgoingLink 类型
const OutgoingLinkType = new GraphQLObjectType({
    name: 'Outgoing_link',
    fields: () => ({
        url: { type: GraphQLString },
        id: { type: GraphQLID },
        from_link: {
            type: PageType,
            resolve(parent, args) {
                //return _.find(pages, {id: parent.from_id});
                return Outgoing_link.findById(parent.id)
            }
        }
    })
});

// 定义 RootQuery 类型
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: () => ({
        book: {
            type: BookType,
            args: {id: { type: GraphQLID }},
            resolve(parent, args) {
                // 从数据库或其他数据源获取数据的代码
                console.log(typeof(args.id));
                //return _.find(books, {id: args.id});
                return Book.findById(args.id);
            }
        },
        page: {
            type: PageType,
            args: { title: { type: GraphQLString } },
            resolve(parent, args) {
                // 从数据库或其他数据源获取数据的代码
                //return _.find(pages, {title: args.title});
                return Page.findOne({title:args.title});
            }
        },
        author: {
            type: AuthorType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args) {
                //return _.find(authors, {id: args.id});
                return Author.findById(args.id)
            }
        },
        outgoing_link: {
            type: OutgoingLinkType,
            args: {from_id: {type: GraphQLID}},
            resolve(parent, args) {
                //return _.find(outgoing_links, {from_id: args.from_id});
                return Outgoing_link.findOne({from_id: args.from_id});
            }
        },
        books: {
            type: new GraphQLList(BookType),
            resolve(parent, args) {
                //return books
                return Book.find({});
            }
        },
        pages: {
            type: new GraphQLList(PageType),
            resolve(parent, args) {
                //return pages
                return Page.find({});
            }
        },
        authors: {
            type: new GraphQLList(AuthorType),
            resolve(parent, args) {
                //return authors
                return Author.find({});
            }
        },
        outgoing_links: {
            type: new GraphQLList(OutgoingLinkType),
            resolve(parent, args) {
                //return outgoing_links
                return Outgoing_link.find({});
            }
        }
    })
});

// 导出 GraphQLSchema
module.exports = new GraphQLSchema({
    query: RootQuery
});
