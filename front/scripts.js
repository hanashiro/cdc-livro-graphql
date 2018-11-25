const listaAlunos = document.querySelector('#listaAlunos');


const GraphQl = {
	endpoint: 'http://localhost:4000/graphql',
	exec: function(query, variaveis){
		return fetch(GraphQl.endpoint, {
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({ query: query, variables: variaveis }),
		})
  		.then(resposta => resposta.json())
	}
}

const Aluno = {
	lista: [],
	buscar: function(){
		const query = `
		query{
		  alunoes{
		    id
		    nomeCompleto
		    idade
		  }
		}
		`;
		return GraphQl.exec(query);
	},
	criar: function(novoAluno){
		const query = `
		mutation ($nomeCompleto: String!, $idade: Int!){
		  createAluno(data: {
		    nomeCompleto: $nomeCompleto
		    idade: $idade
		  }){
		    id
		    nomeCompleto
		    idade
		  }
		}
		`;
		return GraphQl.exec(query, novoAluno);
	},
	apagar: function(id){
		const query = `
		mutation ($id: ID!){
		  deleteAluno(
		    where: {
		      id: $id
		    }
		  ){
		    id
		  }
		}
		`;
		return GraphQl.exec(query, {id});
	}
}

const Template = {
	iniciar: function(){
		Aluno.buscar()
			.then(({data: {alunoes}}) => {
				Aluno.lista = alunoes;
				Template.listarAluno();
			})
	},
	listarAluno: function(){
		let html = ''
		Aluno.lista.forEach((aluno) => {
			html += `<li>Nome: ${aluno.nomeCompleto} - Idade: ${aluno.idade} - <button onclick="Template.apagarAluno('${aluno.id}')" >X</button></li>`
		})
		listaAlunos.innerHTML = html;
	},
	criarAluno: function(){
		event.preventDefault();
		const formulario = document.forms.novoAluno,
			novoAluno = {
			nomeCompleto: formulario.nomeCompleto.value,
			idade: parseInt(formulario.idade.value)
		};
		if(novoAluno.nomeCompleto && novoAluno.idade){
			formulario.nomeCompleto.value = '';
			formulario.idade.value = '';
			Aluno.criar(novoAluno)
				.then(({data: {createAluno}}) => {
					Template.inserirAlunoLista(createAluno);
				})
		}
	},
	inserirAlunoLista: function(novoAluno){
		Aluno.lista.push(novoAluno);
		Template.listarAluno();
	},
	apagarAluno: function(id){
		Aluno.apagar(id)
			.then(() => {
				Template.removerAlunoLista(id);
			})
	},
	removerAlunoLista: function(id){
		const alunoIndice = Aluno.lista.findIndex(aluno => aluno.id === id);
		if(alunoIndice >= 0){
			Aluno.lista.splice(alunoIndice, 1);
			Template.listarAluno();
		}
	}
}


Template.iniciar();