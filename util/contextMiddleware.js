const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/env.json');
const {PubSub}  = require('apollo-server')
const pubsub = new PubSub()
module.exports = context => {

    let token;
    // console.log("context: ", context.connection.context.Authorization);
    if(context.req && context.req.headers.authorization){
        token = context.req.headers.authorization.split('Bearer ')[1];
        // console.log(token);

    } else if (context.connection && context.connection.context.Authorization){
        token = context.connection.context.Authorization.split('Bearer ')[1];
    }

    jwt.verify(token, JWT_SECRET, (err, docodedToken) => {

        context.user = docodedToken;
        // console.log(user);
    })

    context.pubsub = pubsub;
    return context;
}