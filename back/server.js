const express = require('express'),
	express_graphql = require('express-graphql'),
	cors = require('cors'),
	{ createServer } = require('http'),
	schema = require('./schema'),
	resolvers = require('./resolvers');

const app = express();
const server = createServer(app);

app.use('/graphql', cors(), express_graphql({
    schema,
    rootValue: resolvers,
    graphiql: true
}));

server.listen(4000, () => {
	console.log('servidor funcionando!');
});