const { ApolloServer} = require('apollo-server');
const {  ApolloServerPluginLandingPageGraphQLPlayground} = require('apollo-server-core');
const {sequelize} = require('./models');


const resolvers = require('./graphql/resolvers');
const typeDefs = require('./graphql/typeDefs'); 
const contextMiddleware = require('./util/contextMiddleware');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: contextMiddleware,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground({
      // options
    }),
  ],
});

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
  sequelize
  .authenticate()
  .then(() => {
      console.log(`database connected !!`)
  })
  .catch(err => console.log(err));
});