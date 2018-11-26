const { PubSub } = require('apollo-server');
const pubsub = new PubSub();


const listaAlunos = [
	{
		"id": "123",
		"nomeCompleto": "Carlos Monteiro",
		"idade": 25
	},
	{
		"id": "456",
		"nomeCompleto": "Maria Silva",
		"idade": 26
	},
	{
		"id": "789",
		"nomeCompleto": "João Souza",
		"idade": 23
	}
];

const resolvers = {
	Query: {
		aluno: function(root, args) {  
			var id = args.id;
			return listaAlunos.filter(aluno => {
				return aluno.id == id;
			})[0];
		},
		alunoes: function() {
			return listaAlunos;
		}
	},
	Mutation: {
		createAluno: function(root, args){
			const novoAluno = args.data;
			novoAluno.id = Date.now();
			
			listaAlunos.push(novoAluno);

			pubsub.publish('aluno_CREATED', {
				aluno: {
					mutation: 'CREATED',
					node: novoAluno,
					previousValues: null
			
				}
			});
			return novoAluno;
		},
		deleteAluno: function(root, args){
			const indice = listaAlunos.findIndex(aluno => aluno.id == args.where.id);
			if(indice >= 0){
				const alunoDeletado =  listaAlunos.splice(indice, 1)[0];
				pubsub.publish('aluno_DELETED', {
					aluno: {
						mutation: 'DELETED',
						node: null,
						previousValues: alunoDeletado
					}
				});
				return alunoDeletado;
			}
			return null;
		}
	},
	Subscription: {
		aluno: {
		  subscribe: (root, args) => {
			  const eventNames = args.where.mutation_in.map(eventName => `aluno_${eventName}`);
			  return pubsub.asyncIterator(eventNames);
		  }
		},
	},
};

module.exports = resolvers;