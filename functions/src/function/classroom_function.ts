import DatabaseReferences from "../database-references";
let admin = require('firebase-admin');


// ON UPDATE

export function classroomOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  console.log("turmaOnUpdate :: " + docId);

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
  if (docAfterData.studentRefTemp !== null && docBeforeData.studentRefTemp != docAfterData.studentRefTemp) {
    // if (docAfterData.studentRefTemp!==null) {
    for (var [key, value] of Object.entries(docAfterData.studentRefTemp)) {
      console.log('Processando ', key);
      userExistOrAdd(value, docId);
    }
    // }
    DatabaseReferences.classroom.doc(docId).update({
      'studentRefTemp': null
    }).then((doc) => {
      // console.log("OK 02")
    }).catch((err) => {
      //console.log("atualizarAplicarAplicada. exameId: " + exameId + ". Erro " + err)
    });
  }
  return 0
}

async function userExistOrAdd(userInfo: any, classroomId: any) {
  console.log('userExistOrAdd 1: ', userInfo, classroomId)
  await DatabaseReferences.user.where("email", "==", userInfo.email).get().then((userSnapShot: any) => {

    if (userSnapShot.docs.length > 0) {
      let userExist = userSnapShot.docs[0];
      console.log("userExistOrAdd 2: Atualizando apenas em user.classroomId para q ele pertença a aquela turma.")
      DatabaseReferences.user.doc(userExist.id).set({
        classroomId: admin.firestore.FieldValue.arrayUnion(classroomId),
      }, { merge: true })
      DatabaseReferences.classroom.doc(classroomId).update({
        [`studentRef.${userExist.id}`]: {
          id: userExist.id,
          code: userInfo.code,
          email: userInfo.email,
          name: userInfo.name,
        },
        // [`studentRefTemp.${userInfo.id}`]: admin.firestore.FieldValue.delete()
      }).then((doc) => {
        // console.log("OK 02")
      }).catch((err) => {
        //console.log("atualizarAplicarAplicada. exameId: " + exameId + ". Erro " + err)
      });

    } else {
      console.log("userExistOrAdd 3: Criando novo usuario");
      DatabaseReferences.addNewUser(userInfo, classroomId);
      //TODO: Precisa de promise. Pois ele pode apagar antes de incluir ?
      // DatabaseReferences.onDeleteDocument('UsuarioNovo', 'email', docData.email)

    }
  }).catch((error: any) => {
    console.log("userExistOrAdd 4: Error. " + error);
  });
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

