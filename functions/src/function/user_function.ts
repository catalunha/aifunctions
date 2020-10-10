import DatabaseReferences from "../database-references";
let admin = require('firebase-admin');


// ON UPDATE

export function userOnUpdate(docSnapShot: any) {
  // const docBeforeData = docSnapShot.before.data();
  // const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  console.log("userOnUpdate :: " + docId);

  
  return 0
}


export function userOnDelete(docSnapShot: any) {
  const docData = docSnapShot.data();
  const docId = docSnapShot.id;
  console.log("userOnDelete :: " + docId);
  if (docData.isTeacher == true) {
    //console.log("usuarioOnDelete. Apagando Turma.");
    DatabaseReferences.deleteDocumentGeneric('classroom', 'userRef.id', docId);
    DatabaseReferences.deleteDocumentGeneric('exame', 'userRef.id', docId);
    DatabaseReferences.deleteDocumentGeneric('question', 'userRef.id', docId);
    DatabaseReferences.deleteDocumentGeneric('task', 'teacherUserRef.id', docId);
    // Do professor nao apagar know nem situation. Fica como nosso banco de dados.
  }
  if (docData.isTeacher == false) {
    //console.log("usuarioOnDelete. Apagando Tarefa. Atualizando Avaliacao | Encontro.");
    DatabaseReferences.deleteDocumentGeneric('task', 'studentUserRef.id', docId);
    DatabaseReferences.updateDocumentWhereEquals('exame', [`studentMap.${docId}`], true, { [`studentMap.${docId}`]: admin.firestore.FieldValue.delete() })
    DatabaseReferences.updateDocumentWhereEquals('exame', [`studentMap.${docId}`], false, { [`studentMap.${docId}`]: admin.firestore.FieldValue.delete() })
  }
  return 0;
}


