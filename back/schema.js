const { gql} = require('apollo-server');
const schema = gql`
type Query {
    aluno(id: ID!): Aluno
    alunoes: [Aluno]!
}

type Mutation {
    createAluno(data: AlunoInput!): Aluno
    deleteAluno(where: AlunoWhere!): Aluno
}

type Subscription {
	aluno(where: AlunoSubscriptionFilter!): AlunoSubscriptionPayload
}

type Aluno{
    id: ID!
    nomeCompleto: String!
    idade: Int
}

input AlunoInput{
	nomeCompleto: String!
	idade: Int
}
input AlunoWhere{
	id: ID!
}

input AlunoSubscriptionFilter {
	mutation_in: [ ModelMutationType! ]
}

type AlunoSubscriptionPayload{
	mutation: ModelMutationType
	node: Aluno 
	previousValues: Aluno
}

enum ModelMutationType{
	CREATED
	UPDATED
	DELETED
}
`;
module.exports = schema; 