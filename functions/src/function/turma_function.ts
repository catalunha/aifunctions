import DatabaseReferences from "../database-references";
let admin = require('firebase-admin');


// ON UPDATE

export function turmaOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  //console.log("turmaOnUpdate :: " + docId);

  if (docBeforeData.nome != docAfterData.nome) {
    //console.log("Turma.Nome alterado. Atualizando em: Avaliacao | Questao | Tarefa | Encontro.")
    DatabaseReferences.updateDocumentWhereEquals('Avaliacao', 'turma.id', docId, { 'turma.nome': docAfterData.nome })
    DatabaseReferences.updateDocumentWhereEquals('Questao', 'turma.id', docId, { 'turma.nome': docAfterData.nome })
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'turma.id', docId, { 'turma.nome': docAfterData.nome })
    DatabaseReferences.updateDocumentWhereEquals('Encontro', 'turma.id', docId, { 'turma.nome': docAfterData.nome })
  } 
  return 0
}

export function turmaOnDelete(docSnapShot: any) {
  const docId = docSnapShot.id;
  //console.log("turmaOnDelete :: " + docId);
  //console.log("turmaOnDelete. Apagando Avaliacao | Encontro.");
  DatabaseReferences.deleteDocumentGeneric('Avaliacao', 'turma.id', docId);
  DatabaseReferences.deleteDocumentGeneric('Encontro', 'turma.id', docId);
  DatabaseReferences.updateDocumentWhereArrayContains('Usuario', 'turma', docId, { 'turma': admin.firestore.FieldValue.arrayRemove(docId)});
  return 0;
}

