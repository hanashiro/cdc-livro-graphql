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
    aluno: function(args) {  
	    return listaAlunos.find(aluno => aluno.id == args.id);
	},
    alunoes: function() {
	    return listaAlunos;
	},
	createAluno: function(args){
		const novoAluno = args.data;
		novoAluno.id = Date.now();
		listaAlunos.push(novoAluno);
        return novoAluno;
	},
	deleteAluno: function(args){
		const indice = listaAlunos.findIndex(aluno => aluno.id == args.where.id);
		if(indice >= 0){
			return listaAlunos.splice(indice, 1)[0];
		}
		return null;
	}
};

module.exports = resolvers;