const { ApolloServer } = require('apollo-server'),
	schema = require('./schema'),
	resolvers = require('./resolvers');

const server = new ApolloServer({ typeDefs: schema, resolvers });

server.listen(3000).then(() => {
	console.log(`Servidor funcionando!`);
});
