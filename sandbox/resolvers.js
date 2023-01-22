const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const Helpers = require('./helpers');

const listaAlunos = [];

const listaCursos = [];


const resolvers = {
	Query: {
		aluno: function(root, args) {  
			const id = args.id;
			return listaAlunos.find(aluno => aluno.id == id);
		},
		alunos: function(root, args) {
			let result = listaAlunos;			
			if(args.where){
				if(args.where.idade){
					return result.filter(aluno => aluno.idade === args.where.idade);
				}
				if(args.where.idade_in){
					return result.filter(aluno => args.where.idade_in.includes(aluno.idade));
				}
				if(args.where.idade_lt){
					return result.filter(aluno => aluno.idade < args.where.idade_lt);
				}
				if(args.where.idade_gt){
					return result.filter(aluno => aluno.idade > args.where.idade_gt);
				}
				if(args.where.idade_not){
					return result.filter(aluno => aluno.idade !== args.where.idade_not);
				}
				if(args.where.idade_lte){
					return result.filter(aluno => aluno.idade <= args.where.idade_lte);
				}
				if(args.where.idade_gte){
					return result.filter(aluno => aluno.idade >= args.where.idade_gte);
				}
				if(args.where.nomeCompleto){
					return result.filter(aluno => aluno.nomeCompleto === args.where.nomeCompleto);
				}
				if(args.where.nomeCompleto_ends_with){
					return result.filter(aluno => aluno.nomeCompleto.endsWith(args.where.nomeCompleto_ends_with));
				}
				if(args.where.nomeCompleto_starts_with){
					return result.filter(aluno => aluno.nomeCompleto.startsWith(args.where.nomeCompleto_starts_with));
				}
				if(args.where.nomeCompleto_not_contains){
					return result.filter(aluno => !aluno.nomeCompleto.includes(args.where.nomeCompleto_not_contains));
				}
				if(args.where.nomeCompleto_not_ends_with){
					return result.filter(aluno => !aluno.nomeCompleto.endsWith(args.where.nomeCompleto_not_ends_with));
				}
				if(args.where.nomeCompleto_not_starts_with){
					return result.filter(aluno => !aluno.nomeCompleto.startsWith(args.where.nomeCompleto_not_starts_with));
				}
				if(args.where.skip){
					result = result.slice(args.where.skip);
				}
				if(args.where.first){
					result = result.slice(0, args.where.first);
				}
				if(args.where.orderBy){
					result = result.sort((a, b) => {
						if(a[args.where.orderBy] > b[args.where.orderBy]){
							return 1;
						}
						if(a[args.where.orderBy] < b[args.where.orderBy]){
							return -1;
						}
						return 0;
					});
				}
			}
			return result;
		},
		curso: function(root, args) {
			const id = args.id;
			return listaCursos.find(curso => curso.id == id);
		},
		cursos: function(root, args) {
			return listaCursos;
		}
	},
	Aluno: {
		curso: function(root) {
			if(root.curso){
				return listaCursos.find(curso => curso.id == root.curso.id);
			}
			return null;
		}
	},
	Curso: {
		alunos: function(root) {
			return listaAlunos.filter(aluno => root.alunos.includes(aluno.id));
		}
	},
	Mutation: {
		createAluno: function(root, args){
			const novoAluno = args.data;
			listaAlunos.push(novoAluno);
			
			novoAluno.id = Date.now();

			if(novoAluno.curso_create){
				const novoCurso = resolvers.Mutation.createCurso(root, {data: novoAluno.curso_create});
				Helpers.conectar(listaAlunos, listaCursos, novoAluno.id, novoCurso.id);
			}else if(novoAluno.curso_connect){
				Helpers.conectar(listaAlunos, listaCursos, novoAluno.id, novoAluno.curso_connect.id);
			}

			Reflect.deleteProperty(novoAluno, 'curso_create');
			Reflect.deleteProperty(novoAluno, 'curso_connect');
			
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
				Helpers.desconectar(listaAlunos, listaCursos, alunoDeletado.id);
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
		},
		updateAluno: function(root, args){
			const indice = listaAlunos.findIndex(aluno => aluno.id == args.where.id);
			if(indice >= 0){
				const alunoAtualizado = Object.assign(listaAlunos[indice], args.data);
				if(args.data.curso_connect){
					Helpers.conectar(listaAlunos, listaCursos, alunoAtualizado.id, args.data.curso_connect.id);
				}else if(args.data.curso_disconnect){
					Helpers.desconectar(listaAlunos, listaCursos, alunoAtualizado.id, args.data.curso_disconnect.id);
				}

				Reflect.deleteProperty(alunoAtualizado, 'curso_connect');
				Reflect.deleteProperty(alunoAtualizado, 'curso_disconnect');

				pubsub.publish('aluno_UPDATED', {
					aluno: {
						mutation: 'UPDATED',
						node: alunoAtualizado,
						previousValues: null
					}
				});
				return alunoAtualizado;
			}
			return null;
		},
		createCurso: function(root, args){
			const novoCurso = args.data;
			novoCurso.id = Date.now();
			novoCurso.alunos = [];

			if(novoCurso.alunos_create){
				novoCurso.alunos_create.forEach(aluno_create => {
					const novoAluno = resolvers.Mutation.createAluno(root, {data: aluno_create});
					novoAluno.curso = { id: novoCurso.id };
					novoCurso.alunos.push(novoAluno.id);
				});
			}
			if(novoCurso.alunos_connect){
				novoCurso.alunos_connect.forEach(aluno_connect => {
					Helpers.conectar(listaAlunos, listaCursos, aluno_connect.id, novoCurso.id);
				});
			}

			listaCursos.push(novoCurso);
			return novoCurso;
		},
		deleteCurso: function(root, args){
			const indice = listaCursos.findIndex(curso => curso.id == args.where.id);
			if(indice >= 0){
				const cursoId = listaCursos[indice].id;
				listaAlunos.forEach(aluno => {
					if(aluno.curso && aluno.curso.id == cursoId){
						aluno.curso = null;
					}
				});
				return listaCursos.splice(indice, 1)[0];
			}
			return null;
		},
		updateCurso: function(root, args){
			const indice = listaCursos.findIndex(curso => curso.id == args.where.id);
			if(indice >= 0){
				const novoCurso =  Object.assign(listaCursos[indice], args.data);
				if(args.data.alunos_connect){
					args.data.alunos_connect.forEach(aluno_connect => {
						Helpers.conectar(listaAlunos, listaCursos, aluno_connect.id, novoCurso.id);
					});
				}
				if(args.data.alunos_disconnect){
					args.data.alunos_disconnect.forEach(aluno_disconnect => {
						Helpers.desconectar(listaAlunos, listaCursos, aluno_disconnect.id, novoCurso.id);
					});
				}
				Reflect.deleteProperty(novoCurso, 'alunos_connect');
				Reflect.deleteProperty(novoCurso, 'alunos_disconnect'); 
				return novoCurso;
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
		}
	},
};

module.exports = resolvers;