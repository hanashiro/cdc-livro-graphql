const Helpers = {
    Cursos: {
        removerAluno(listaAlunos, listaCursos, idAluno){
            listaCursos.forEach(curso => {
                curso.alunos = curso.alunos.filter(id => id != idAluno);
            });
        }        
    },
    Alunos: {
        removerCurso(listaAlunos, listaCursos, idAluno){
            const aluno = listaAlunos.find(aluno => aluno.id == idAluno);
            if(aluno && aluno.curso){
                aluno.curso = null;
            }
        }
    },
    desconectar(listaAlunos, listaCursos, idAluno){
        Helpers.Cursos.removerAluno(listaAlunos, listaCursos, idAluno);
        Helpers.Alunos.removerCurso(listaAlunos, listaCursos, idAluno);
    },
    conectar(listaAlunos, listaCursos, idAluno, idCurso){
        Helpers.desconectar(listaAlunos, listaCursos, idAluno);
        const aluno = listaAlunos.find(aluno => aluno.id == idAluno);
        const curso = listaCursos.find(curso => curso.id == idCurso);
        if(aluno && curso){
            aluno.curso = { id: curso.id };
            curso.alunos.push(aluno.id);
        }
    }
}

module.exports = Helpers