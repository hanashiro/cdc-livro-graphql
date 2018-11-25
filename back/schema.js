const { buildSchema } = require('graphql');
const schema = `
type Query {
    aluno(id: ID!): Aluno
    alunoes: [Aluno]!
}

type Mutation {
    createAluno(data: AlunoInput!): Aluno
    deleteAluno(where: AlunoWhere!): Aluno
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
`;
module.exports = buildSchema(schema);