const schema = `
type Query {
    aluno(id: ID!): Aluno
    alunos(where: AlunosWhere): [Aluno]!
	curso(id: ID!): Curso
	cursos: [Curso]!
}

type Mutation {
    createAluno(data: AlunoInput!): Aluno
    deleteAluno(where: AlunoWhere!): Aluno
	updateAluno(where: AlunoWhere!, data: AlunoUpdate!): Aluno

	createCurso(data: CursoInput!): Curso
	deleteCurso(where: CursoWhere!): Curso
	updateCurso(where: CursoWhere!, data: CursoInput!): Curso
}

type Subscription {
	aluno(where: AlunoSubscriptionFilter!): AlunoSubscriptionPayload
	curso(where: CursoSubscriptionFilter!): CursoSubscriptionPayload
}

type Aluno{
    id: ID!
    nomeCompleto: String!
    idade: Int
	curso: Curso
}

type Curso{
	id: ID!
    disciplina: String!
    alunos: [Aluno!]!
}

input AlunoInput{
	nomeCompleto: String!
	idade: Int	
	curso_create: CursoInput
	curso_connect: CursoWhere
	curso_disconnect: Boolean
}
input AlunoWhere{
	id: ID!
}
input AlunoUpdate{
	nomeCompleto: String
	idade: Int	
	curso_connect: CursoWhere
	curso_disconnect: Boolean
}
input AlunosWhere{
	idade: Int
	idade_in: [Int!]
	idade_lt: Int
	idade_gt: Int
	idade_not: Int
	idade_lte: Int
	idade_gte: Int

	nomeCompleto: String
	nomeCompleto_ends_with: String
	nomeCompleto_starts_with: String
	nomeCompleto_not_contains: String
	nomeCompleto_not_ends_with: String
	nomeCompleto_not_starts_with: String

	first: Int
	skip: Int

	orderBy: String
}
input CursoInput{
	disciplina: String!
	alunos_create: [AlunoInput!]
	alunos_connect: [AlunoWhere!]
	alunos_disconnect: [AlunoWhere!]
}
input CursoWhere{
	id: ID!	
}

input AlunoSubscriptionFilter {
	mutation_in: [ ModelMutationType! ]
}
input CursoSubscriptionFilter {
	mutation_in: [ ModelMutationType! ]
}


type AlunoSubscriptionPayload{
	mutation: ModelMutationType
	node: Aluno 
	previousValues: Aluno
}
type CursoSubscriptionPayload{
	mutation: ModelMutationType
	node: Curso
	previousValues: Curso
}
	

enum ModelMutationType{
	CREATED
	UPDATED
	DELETED
}
`;
module.exports = schema; 