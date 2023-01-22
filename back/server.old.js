const { ApolloServer } = require('@apollo/server'),
	{ startStandaloneServer } = require('@apollo/server/standalone'),
	schema = require('./schema'),
	resolvers = require('./resolvers');

const server = new ApolloServer({ typeDefs: schema, resolvers });

startStandaloneServer(server, {
	listen: { port: 3000 }
}).then(() => {
	console.log(`Servidor funcionando!`);
});
