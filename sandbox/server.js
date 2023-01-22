const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const {
	ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer');
const { createServer } = require('http');
const express = require('express');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const bodyParser = require('body-parser');
const cors = require('cors');

const resolvers = require('./resolvers');
const schema = require('./schema');

const PORT = 3000;

// Cria o esquema, que será usado separadamente pelo ApolloServer e
// o servidor WebSocket.
const schemaExecutavel = makeExecutableSchema({ typeDefs: schema, resolvers });

// Cria uma aplicação Express e um servidor HTTP; vamos anexar o servicor
// WebSocket e o ApolloServer para este servidor HTTP.
const app = express();
const servidorHttp = createServer(app);

// Crie nosso servidor WebSocket usando o servidor HTTP que acabamos de configurar.
const servidorWS = new WebSocketServer({
	server: servidorHttp,
	path: "/graphql",
});

// Salva as informações do servidor retornado para que possamos
// desligar este servidor mais tarde
const limparServidor = useServer({ schema: schemaExecutavel }, servidorWS);

// Configuração do ApolloServer.
const servidor = new ApolloServer({
	schema: schemaExecutavel,
	plugins: [
		// Desligamento adequado para o servidor HTTP.
		ApolloServerPluginDrainHttpServer({ httpServer: servidorHttp }),

		// Desligamento adequado para o servidor WebSocket.
		{
			async serverWillStart() {
				return {
					async drainServer() {
						await limparServidor.dispose();
					},
				};
			},
		},
	],
});

servidor.start().then(() => {
	app.use("/graphql", cors(), bodyParser.json(), expressMiddleware(servidor));

	// Agora que nosso servidor HTTP está totalmente configurado, podemos iniciá-lo.
	servidorHttp.listen(PORT, () => {
		console.log(`Servidor funcionando em http://localhost:${PORT}/graphql`);
	});
});
