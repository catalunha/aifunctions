import DatabaseReferences from "../database-references";
let admin = require('firebase-admin');


// ON UPDATE

export function classroomOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  //console.log("turmaOnUpdate :: " + docId);

  if (docBeforeData.company != docAfterData.company) {
    //console.log("Turma.Nome alterado. Atualizando em: Avaliacao | Questao | Tarefa | Encontro.")
    DatabaseReferences.updateDocumentWhereEquals('exame', 'classroomRef.id', docId, { 'classroomRef.company': docAfterData.company })
    DatabaseReferences.updateDocumentWhereEquals('question', 'classroomRef.id', docId, { 'classroomRef.company': docAfterData.company })
    DatabaseReferences.updateDocumentWhereEquals('task', 'classroomRef.id', docId, { 'classroomRef.company': docAfterData.company })
  }
  if (docBeforeData.component != docAfterData.component) {
    //console.log("Turma.Nome alterado. Atualizando em: Avaliacao | Questao | Tarefa | Encontro.")
    DatabaseReferences.updateDocumentWhereEquals('exame', 'classroomRef.id', docId, { 'classroomRef.component': docAfterData.component })
    DatabaseReferences.updateDocumentWhereEquals('question', 'classroomRef.id', docId, { 'classroomRef.component': docAfterData.component })
    DatabaseReferences.updateDocumentWhereEquals('task', 'classroomRef.id', docId, { 'classroomRef.component': docAfterData.component })
  }
  if (docBeforeData.name != docAfterData.name) {
    //console.log("Turma.Nome alterado. Atualizando em: Avaliacao | Questao | Tarefa | Encontro.")
    DatabaseReferences.updateDocumentWhereEquals('exame', 'classroomRef.id', docId, { 'classroomRef.name': docAfterData.name })
    DatabaseReferences.updateDocumentWhereEquals('question', 'classroomRef.id', docId, { 'classroomRef.name': docAfterData.name })
    DatabaseReferences.updateDocumentWhereEquals('task', 'classroomRef.id', docId, { 'classroomRef.name': docAfterData.name })
  }
  if (docBeforeData.studentUserRefMapTemp != docAfterData.studentUserRefMapTemp) {
    DatabaseReferences.classroom.doc(docId).set({
      [`questionMap.${docBeforeData.name}`]: true
    }, { merge: true }).then(() => {
      ////console.log("OK 02")
    }).catch((err) => {
      //console.log("atualizarAplicarAplicada. exameId: " + exameId + ". Erro " + err)
    })
  }


  return 0
}
function getNumeroAleatorio(min: any, max: any) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
export function classroomOnDelete(docSnapShot: any) {
  const docId = docSnapShot.id;
  //console.log("turmaOnDelete :: " + docId);
  //console.log("turmaOnDelete. Apagando Avaliacao | Encontro.");
  DatabaseReferences.deleteDocumentGeneric('exame', 'classroomRef.id', docId);
  DatabaseReferences.deleteDocumentGeneric('question', 'classroomRef.id', docId);
  DatabaseReferences.deleteDocumentGeneric('task', 'classroomRef.id', docId);
  DatabaseReferences.updateDocumentWhereArrayContains('user', 'classroomId', docId, { 'classroomId': admin.firestore.FieldValue.arrayRemove(docId) });
  return 0;
}

