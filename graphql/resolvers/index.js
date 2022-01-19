const userResolvers = require('./users');
const messageResolvers = require('./messages');
const videoResolvers = require('./video');
const {User, Message} = require('../../models')

module.exports = {
    Message:{
        createdAt: (parent) => parent.createdAt.toISOString(),
    },
    User:{
        createdAt: (parent) => parent.createdAt.toISOString(),
    },
    Reaction:{
        createdAt: (parent) => parent.createdAt.toISOString(),
        message: async (parent) => await Message.findByPk(parent.messageId),
        user: async (parent) => await User.findByPk(parent.userId, {attributes: ['username', 'imageUrl', 'createdAt']}),

    },
    Query: {
        ...userResolvers.Query,
        ...messageResolvers.Query,
        ...videoResolvers.Query,
    },
    Mutation: {
        ...userResolvers.Mutation,
        ...messageResolvers.Mutation,
        ...videoResolvers.Mutation
    },
    Subscription: {
        ...messageResolvers.Subscription,
        ...videoResolvers.Subscription
    }
}