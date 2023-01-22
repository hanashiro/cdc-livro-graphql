const listaAlunos = document.querySelector('#listaAlunos');


const GraphQl = {
	endpoint: 'http://localhost:3000/graphql',
	wsConnection: new WebSocket('ws://localhost:3000/graphql', 'graphql-transport-ws'),
	exec: function(query, variaveis){
		return fetch(GraphQl.endpoint, {
		  method: 'POST',
		  headers: {
		    'Content-Type': 'application/json'
		  },
		  body: JSON.stringify({ query: query, variables: variaveis }),
		})
  		.then(resposta => resposta.json())
	},
	iniciarWS: function(){
		return new Promise(resolve => {
				GraphQl.wsConnection.onopen = function(){
					const mensagem = {
								type: 'connection_init'
					};
					GraphQl.wsConnection.send(JSON.stringify(mensagem));

					GraphQl.wsConnection.onmessage = function (event) {
						const resposta = JSON.parse(event.data);
						if(resposta.type === 'connection_ack'){
							resolve();
						}
						if(resposta.type === 'next'){
							const aluno = resposta.payload.data.aluno;
							if(aluno.mutation === 'CREATED'){
								Template.inserirAlunoLista(aluno.node);
							}else if(aluno.mutation === 'DELETED'){
								const id = aluno.previousValues.id;  
								Template.removerAlunoLista(id);
							}
						}
					}
			}
		})
	}
}

const Aluno = {
	lista: [],
	buscar: function(){
		const query = `
		query{
		  alunos{
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
	},
	subscription: function(){
		const query = `
		subscription updatedAlunos {
		  aluno(where: {
		    mutation_in: [CREATED, DELETED]
		  }){
		    mutation
		    node{
		      id
		      nomeCompleto
		      idade
		    }
	    	previousValues{
			  	id
	    	}
		  }
		}
		`;
		GraphQl.wsConnection.send(JSON.stringify({
			id: '1',
			type: 'subscribe',
			payload: { query }
		}))
	}
}

const Template = {
	iniciar: function(){
		Aluno.buscar()
			.then(({data: {alunos}}) => {
				Aluno.lista = alunos;
				Template.listarAluno();
			})

		GraphQl.iniciarWS().then(Aluno.subscription);
	},
	listarAluno: function(){
		let html = ''
		Aluno.lista.forEach((aluno) => {
			html += `<li>Nome: ${aluno.nomeCompleto} - Idade: ${aluno.idade} - <button onclick="Template.apagarAluno('${aluno.id}')" >X</button></li>`
		})
		listaAlunos.innerHTML = html;
	},
	criarAluno: function(event){
		event.preventDefault();
		const formulario = document.forms.novoAluno,
			novoAluno = {
			nomeCompleto: formulario.nomeCompleto.value,
			idade: parseInt(formulario.idade.value)
		};
		if(novoAluno.nomeCompleto && novoAluno.idade){
			formulario.nomeCompleto.value = '';
			formulario.idade.value = '';
			Aluno.criar(novoAluno);
		}
	},
	inserirAlunoLista: function(novoAluno){
		Aluno.lista.push(novoAluno);
		Template.listarAluno();
	},
	apagarAluno: function(id){
		Aluno.apagar(id);
	},
	removerAlunoLista: function(id){
		Aluno.lista = Aluno.lista.filter(aluno => aluno.id !== id);
		Template.listarAluno();
	}
}


Template.iniciar();