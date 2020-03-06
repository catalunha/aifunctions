import DatabaseReferences from "../database-references";
let admin = require('firebase-admin');


// ON UPDATE

export function usuarioOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  //console.log("usuarioOnUpdate :: " + docId);

  if (docBeforeData.professor == true && (docBeforeData.nome != docAfterData.nome)) {
    //console.log("Professor Usuario.Nome alterado.  Atualizando em: Turma | Pasta | Problema | Simulacao | Avaliacao | Questao | Tarefa | Encontro.");
    DatabaseReferences.updateDocumentWhereEquals('Turma', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Pasta', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Problema', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Simulacao', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Avaliacao', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Questao', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Encontro', 'professor.id', docId, { 'professor.nome': docAfterData.nome });
  }
  if (docBeforeData.professor == false) {
    if (docBeforeData.nome != docAfterData.nome) {
      //console.log("Aluno Usuario.Nome alterado.  Atualizando em: Tarefa.");
      DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'aluno.id', docId, { 'aluno.nome': docAfterData.nome });
    }
    if (docBeforeData.foto.url != docAfterData.foto.url) {
      //console.log("Aluno Usuario.foto.url alterado. Atualizando em: Tarefa");
      DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'aluno.id', docId, { 'aluno.foto': docAfterData.foto.url });
    }
  }
  return 0
}


export function usuarioOnDelete(docSnapShot: any) {
  const docData = docSnapShot.data();
  const docId = docSnapShot.id;
  //console.log("usuarioOnDelete :: " + docId);
  if (docData.professor == true) {
    //console.log("usuarioOnDelete. Apagando Turma.");
    DatabaseReferences.deleteDocumentGeneric('Turma', 'professor.id', docId);
    DatabaseReferences.deleteDocumentGeneric('Avaliacao', 'professor.id', docId);
    DatabaseReferences.deleteDocumentGeneric('Upload', 'usuario', docId);
    // Do professor nao apagar Pasta, Problema, Simulacao. Fica como nosso banco de dados.
  }
  if (docData.professor == false) {
    //console.log("usuarioOnDelete. Apagando Tarefa. Atualizando Avaliacao | Encontro.");
    DatabaseReferences.deleteDocumentGeneric('Tarefa', 'aluno.id', docId);
    DatabaseReferences.deleteDocumentGeneric('Upload', 'usuario', docId);
    DatabaseReferences.updateDocumentWhereArrayContains('Encontro', 'aluno', docId, { 'aluno': admin.firestore.FieldValue.arrayRemove(docId)});
    DatabaseReferences.updateDocumentWhereArrayContains('Avaliacao', 'aplicadaPAluno', docId, { 'aplicadaPAluno': admin.firestore.FieldValue.arrayRemove(docId)});
    DatabaseReferences.updateDocumentWhereArrayContains('Avaliacao', 'aplicadaPAlunoFunction', docId, { 'aplicadaPAlunoFunction': admin.firestore.FieldValue.arrayRemove(docId)});
  }
  return 0;
}


