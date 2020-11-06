import DatabaseReferences from "../database-references";
import { Timestamp } from "@google-cloud/firestore";

export function exameOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;
  //console.log("avaliacaoOnUpdate. id: " + docId);
  if (docBeforeData.name != docAfterData.name) {
    //console.log("Avaliacao.Nome alterado. " + docBeforeData.nome + "!=" + docAfterData.nome + " .Atualizando em: Questao | Tarefa.");
    DatabaseReferences.updateDocumentWhereEquals('question', 'exameRef.id', docId, { 'exameRef.name': docAfterData.name });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'exameRef.name': docAfterData.name });
  }
  if ((docBeforeData.start as Timestamp).toDate().toLocaleString() != (docAfterData.start as Timestamp).toDate().toLocaleString()) {
    //console.log("Avaliacao.Inicio alterado?. " + (docBeforeData.inicio as Timestamp).toDate() + "!=" + (docAfterData.inicio as Timestamp).toDate() + " .Atualizando em: Questao | Tarefa.")
    //console.log("Avaliacao.Inicio alterado?. " + (docBeforeData.inicio as Timestamp).toDate().toLocaleString() + "!=" + (docAfterData.inicio as Timestamp).toDate().toLocaleString() + " .Atualizando em: Questao | Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('question', 'exameRef.id', docId, { 'start': docAfterData.start });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'start': docAfterData.start });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'started': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'lastSendAnswer': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'attempted': 0 });
  }
  if ((docBeforeData.end as Timestamp).toDate().toLocaleString() != (docAfterData.end as Timestamp).toDate().toLocaleString()) {
    //console.log("Avaliacao.fim alterado. " + (docBeforeData.fim as Timestamp).toDate().toLocaleString() + "!=" + (docAfterData.fim as Timestamp).toDate().toLocaleString() + " .Atualizando em: Questao | Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('question', 'exameRef.id', docId, { 'end': docAfterData.end });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'end': docAfterData.end });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'started': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'lastSendAnswer': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'attempted': 0 });
  }
  if (docBeforeData.scoreExame != docAfterData.scoreExame) {
    //console.log("Avaliacao.nota alterado. " + docBeforeData.nota + "!=" + docAfterData.nota + " .Atualizando em: Tarefa.");
    DatabaseReferences.updateDocumentWhereEquals('task', 'exameRef.id', docId, { 'scoreExame': docAfterData.scoreExame });

  }
  if (docBeforeData.isDelivered == false && docAfterData.isDelivered == true) {
    console.log("Avaliacao.aplicar false->true. Aplicando avaliação");
    ExameApply(docSnapShot);
  }
  return 0
}

export function exameOnDelete(docSnapShot: any) {
  const docId = docSnapShot.id;
  //console.log("avaliacaoOnDelete. id: " + docId);
  //console.log("avaliacaoOnDelete. Apagando Questao.");
  DatabaseReferences.deleteDocumentGeneric('question', 'exameRef.id', docId);
  DatabaseReferences.deleteDocumentGeneric('task', 'exameRef.id', docId);
  return 0;
}



async function ExameApply(exameSnapShot: any) {
  let exameData = exameSnapShot.after.data();
  let exameId = exameSnapShot.after.id;
  console.log("ExameApply exameId: " + exameId);
  atualizarAplicarAplicada(exameId);

  //+++ apagar
  //verificar se a condicao isDelivered esta true
  if (!exameData.isDelivered) { return 0; }

  let questionListApply: Array<string> = [];
  let questionListNew: Array<string> = [];
  if (exameData.hasOwnProperty('questionMap')) {
    for (var [key, value] of Object.entries(exameData.questionMap)) {
      if (value) {
        questionListApply.push(key);
      } else {
        questionListNew.push(key);
      }
    }
  }
  let studentListApply: Array<string> = [];
  let studentListNew: Array<string> = [];
  if (exameData.hasOwnProperty('studentMap')) {
    for (var [key, value] of Object.entries(exameData.studentMap)) {
      if (value) {
        studentListApply.push(key);
      } else {
        studentListNew.push(key);
      }
    }
  }
  if (questionListApply.length == 0 && questionListNew.length > 0 && studentListApply.length == 0 && studentListNew.length > 0) {
    // CASO 01 - Todas as questoes para todos os alunos ( não há questoes ou alunos aplicados )
    // questaoApplyTrue=[]   studentListApplyTrue=[]
    // questaoNewFalse=[a,b]   studentListNewFalse=[1,2]
    console.log("Process exame. CASO 01")
    return iniciarProcessoAplicarAvaliacao(questionListNew, studentListNew, exameId, exameData);
  } else if (questionListApply.length > 0 && questionListNew.length > 0 && studentListApply.length > 0 && studentListNew.length == 0) {
    // CASO 02 - Questoes novas para todos os alunos ja aplicados (não há alunos novos )
    // questaoAppTrue=[a,b]   studentAppTrue=[1,2]
    // questaoNewFalse=[c,d]   studentListNewFalse=[]
    console.log("Process exame. CASO 02")
    return iniciarProcessoAplicarAvaliacao(questionListNew, studentListApply, exameId, exameData);
  } else if (questionListApply.length > 0 && questionListNew.length == 0 && studentListApply.length > 0 && studentListNew.length > 0) {
    // CASO 03 - Alunos novos para todas as questoes ja aplicadas (nao há questoes novas)
    // questaoAppTrue=[a,b]   studentAppTrue=[1,2]
    // questaoNewFalse=[]   studentListNewFalse=[3,4]
    console.log("Process exame. CASO 03")
    return iniciarProcessoAplicarAvaliacao(questionListApply, studentListNew, exameId, exameData);
  } else if (questionListApply.length > 0 && questionListNew.length > 0 && studentListApply.length > 0 && studentListNew.length > 0) {
    // CASO 04 - Novos questoes para novos alunos ( com questoes e alunos ja aplicados)
    // questaoAppTrue=[a,b]   studentAppTrue=[1,2]
    // questaoNewFalse=[c,d]   studentListNewFalse=[3,4]
    console.log("Process exame. CASO 04")
    // console.log("Process exame. CASO 04a - (questaoNewFalse->studentAppTrue)")
    iniciarProcessoAplicarAvaliacao(questionListNew, studentListApply, exameId, exameData);
    // console.log("Process exame. CASO 04b - (questaoNewFalse->studentListNewFalse)")
    iniciarProcessoAplicarAvaliacao(questionListNew, studentListNew, exameId, exameData);
    // console.log("Aplicando avaliacao. CASO 04c - (questaoAppTrue->studentListNewFalse)")
    iniciarProcessoAplicarAvaliacao(questionListApply, studentListNew, exameId, exameData);
    return 0;
  } else {
    // console.log("Aplicando avaliacao. Nenhuma condicao foi atingida");
    // atualizarAplicarAplicada(exameId);
    return 0;
  }
}


/**
 * Funcao que percorre lista de questoes e aplica cada questao para um aluno
 * @param questionList 
 * @param studentList 
 * @param exameId 
 * @param exameData 
 * @param marcadorAtualizacao 
 */
async function iniciarProcessoAplicarAvaliacao(questionIdList: any, studentIdList: any, exameId: any, exameData: any) {
  console.log("iniciarProcessoAplicarAvaliacao. questionIdList.length = " + questionIdList.length)
  console.log("iniciarProcessoAplicarAvaliacao. studentIdList.length = " + studentIdList.length)
  console.log("iniciarProcessoAplicarAvaliacao. exameId = " + exameId)

  //pegar lista de documents de questoes
  await getListaDocuments(questionIdList, 'question').then(async (questionDocList: any) => {
    console.log('iniciarProcessoAplicarAvaliacao::questionDocList.length: ', questionDocList.length);

    //pegar a lista de documents de alunos
    await getListaDocuments(studentIdList, 'user').then(async (studentDocList: any) => {
      console.log('iniciarProcessoAplicarAvaliacao::studentDocList.length: ', studentDocList.length);
      //aplicar questao para cada aluno
      await aplicarListaQuestoesEmListaAlunos(questionDocList, studentDocList, exameId, exameData).then((msg) => {
        console.log(msg);


      });
      //TODOCriar function que passando lista de alunos e lista de questionario adicione-os a lista de aplicados
    }).catch((error) => {
      console.log("Erro getListaDocuments user. Erro ", error);
      return 0;
    })
  }).catch((error) => {
    console.log("Erro getListaDocuments question. Erro ", error);
    return 0;
  })

}

/**
 * Funcao que recebe lista de anlunos, lista de questao e aplica avaliacao, fazendo as relacoes de alunos com questoes
 * @param studentList 
 * @param questionList 
 * @param exameData 
 * @param exameId 
 */

function aplicarListaQuestoesEmListaAlunos(questionDocList: any, studentDocList: any, exameId: any, exameData: any) {
  console.log('aplicarListaQuestoesEmListaAlunos::questionDocList.length: ', questionDocList.length);
  console.log('aplicarListaQuestoesEmListaAlunos::studentDocList.length: ', studentDocList.length);

  return new Promise((resolve, reject) => {
    questionDocList.forEach(async (questionDoc: any, index: any, array: any) => {
      await DatabaseReferences.situation.doc(questionDoc.data().situationRef.id).get().then(async (situationDoc) => {
        // console.log('aplicarListaQuestoesEmListaAlunos::questionDoc.id: ', questionDoc.id);
        await aplicarQuestaoParaCadaAluno(questionDoc, studentDocList, exameId, exameData, situationDoc).then(() => {
          // Atualizar campo aplicar, aplicado na avaliacao
          // atualizarAplicarAplicada(exameId);
        }).catch((error) => {
          console.log("Erro aplicarListaQuestoesEmListaAlunos->DatabaseReferences.situation.", error);
        });;
      }).catch((error) => {
        console.log("Erro aplicarListaQuestoesEmListaAlunos->DatabaseReferences.situation.", error);
      });
      if ((index + 1) >= array.length) {
        resolve("Fim da aplicacao de tarefas todas as questões para todos os alunos");
      }
    });
  })
}

function aplicarQuestaoParaCadaAluno(questionDoc: any, studentDocList: any, exameId: any, exameData: any, situationDoc: any) {
  console.log('aplicarQuestaoParaCadaAluno::questionDoc.id: ', questionDoc.id);
  console.log('aplicarQuestaoParaCadaAluno::studentDocList.length: ', studentDocList.length);


  return new Promise((resolve, reject) => {
    // let taskList: any[] = [];
    // let atualizarQuestaoList: any[] = [];
    // let atualizarQuestionStudentApplyList: any[] = [];
    let questionApplyList = new Set();
    let studentApplyList = new Set();
    let batch = DatabaseReferences.db.batch();
    studentDocList.forEach(async (studentDoc: any, index: any, array: any) => {
      // console.log('aplicarQuestaoParaCadaAluno::studentDoc.id: ', studentDoc.id);
      // gerarSalvarNovoDocumentDeTarefa(questionDoc, studentDoc, exameId, exameData, situationDoc, batch, questionApplyList, studentApplyList);
      let simulationIdList = Object.keys(situationDoc.data().simulationModel)
  let numberRandom = getNumeroAleatorio(0, simulationIdList.length - 1);
  let input = {};
  if (situationDoc.data().simulationModel[simulationIdList[numberRandom]].hasOwnProperty('input')) {
    input = situationDoc.data().simulationModel[simulationIdList[numberRandom]].input;
  }
  let output = situationDoc.data().simulationModel[simulationIdList[numberRandom]].output;
  // console.log('input: ', input);
  // console.log('output: ', output);

  let task = {
    teacherUserRef: exameData.userRef,
    classroomRef: questionDoc.data().classroomRef,
    exameRef: questionDoc.data().exameRef,
    questionRef: {
      id: questionDoc.id,
      name: questionDoc.data().name
    },
    situationRef: questionDoc.data().situationRef,
    studentUserRef: {
      id: studentDoc.id,
      name: studentDoc.data().name,
      // email: studentDoc.data().email
      // foto: studentDoc.data().foto.url != null ? studentDoc.data().foto.url : null,
    },
    //dados do exame. mas pode ser alterado pela questao por isto pego da questao
    start: questionDoc.data().start,
    end: questionDoc.data().end,
    scoreExame: exameData.scoreExame,
    //dados da questao
    attempt: questionDoc.data().attempt,
    time: questionDoc.data().time,
    error: questionDoc.data().error,
    scoreQuestion: questionDoc.data().scoreQuestion,
    // gestão da questao
    attempted: 0,
    isOpen: true,
    simulationInput: input,
    simulationOutput: output,
  }
  questionApplyList.add(questionDoc.id);
  studentApplyList.add(studentDoc.id);
  // atualizarQuestaoAplicada(questionDoc.id);
  batch.set(DatabaseReferences.task.doc(), task);
      // atualizarQuestionStudentApply(exameId, questionDoc.id, studentDoc.id);
      // taskList.push(gerarSalvarNovoDocumentDeTarefa(questionDoc, studentDoc, exameId, exameData, situationDoc));
      // atualizarQuestaoList.push(atualizarQuestaoAplicada(questionDoc.id));
      // atualizarQuestionStudentApplyList.push(atualizarQuestionStudentApply(exameId, questionDoc.id, studentDoc.id));
      if ((index + 1) >= array.length) {
        console.log('aplicarQuestaoParaCadaAluno fim');
        // Commit the batch
        batch.commit().then(function () {
          console.log("batch.commit");
        });
        atualizarQuestionStudentApplyList(exameId, questionApplyList, studentApplyList);
        atualizarQuestaoAplicada(questionDoc.id);

        // await Promise.all(taskList);
        // await Promise.all(atualizarQuestaoList);
        // await Promise.all(atualizarQuestionStudentApplyList);
        resolve("Fim de percorrer lista de alunos");
      }
    });
  })

}

// async function gerarSalvarNovoDocumentDeTarefa(questionDoc: any, studentDoc: any, exameId: any, exameData: any, situationDoc: any, batch: any, questionApplyList: any, studentApplyList: any) {
//   // console.log('gerarSalvarNovoDocumentDeTarefa questionDoc.id: ', questionDoc.id);
//   // console.log('gerarSalvarNovoDocumentDeTarefa studentDoc.id: ', studentDoc.id);
//   // console.log('gerarSalvarNovoDocumentDeTarefa exameId: ', exameId);
//   // console.log('gerarSalvarNovoDocumentDeTarefa situationDoc.id: ', situationDoc.id);
//   let simulationIdList = Object.keys(situationDoc.data().simulationModel)
//   let numberRandom = getNumeroAleatorio(0, simulationIdList.length - 1);
//   let input = {};
//   if (situationDoc.data().simulationModel[simulationIdList[numberRandom]].hasOwnProperty('input')) {
//     input = situationDoc.data().simulationModel[simulationIdList[numberRandom]].input;
//   }
//   let output = situationDoc.data().simulationModel[simulationIdList[numberRandom]].output;
//   // console.log('input: ', input);
//   // console.log('output: ', output);

//   let task = {
//     teacherUserRef: exameData.userRef,
//     classroomRef: questionDoc.data().classroomRef,
//     exameRef: questionDoc.data().exameRef,
//     questionRef: {
//       id: questionDoc.id,
//       name: questionDoc.data().name
//     },
//     situationRef: questionDoc.data().situationRef,
//     studentUserRef: {
//       id: studentDoc.id,
//       name: studentDoc.data().name,
//       // email: studentDoc.data().email
//       // foto: studentDoc.data().foto.url != null ? studentDoc.data().foto.url : null,
//     },
//     //dados do exame. mas pode ser alterado pela questao por isto pego da questao
//     start: questionDoc.data().start,
//     end: questionDoc.data().end,
//     scoreExame: exameData.scoreExame,
//     //dados da questao
//     attempt: questionDoc.data().attempt,
//     time: questionDoc.data().time,
//     error: questionDoc.data().error,
//     scoreQuestion: questionDoc.data().scoreQuestion,
//     // gestão da questao
//     attempted: 0,
//     isOpen: true,
//     simulationInput: input,
//     simulationOutput: output,
//   }

//   // console.log('task: ', task);
//   // batch.set(DatabaseReferences.task.doc(), task);
//   // DatabaseReferences.task.add(task)
//   //   .then((doc) => {
//   //     console.log("gerarSalvarNovoDocumentDeTarefa new task", doc.id);
//   //     atualizarQuestaoAplicada(questionDoc.id);
//   //     // atualizarQuestionStudentApply(exameId, questionDoc.id, studentDoc.id);
//   //     questionApplyList.add(questionDoc.id);
//   //     studentApplyList.add(studentDoc.id);
//   //   }).catch((error) => {
//   //     console.log("Erro gerarSalvarNovoDocumentDeTarefa. questionDoc.id: ", questionDoc.id, "studentDoc.id: ", studentDoc.id, ". Erro ", error);
//   //   });
//   questionApplyList.add(questionDoc.id);
//   studentApplyList.add(studentDoc.id);
//   // atualizarQuestaoAplicada(questionDoc.id);
//   batch.set(DatabaseReferences.task.doc(), task);
//   // return task;
//   // await batch.update(DatabaseReferences.question.doc(questionDoc.id), {
//   //   isDelivered: true
//   // });
// }

function atualizarQuestaoAplicada(questionDocId: any) {
  DatabaseReferences.question.doc(questionDocId).update({
    isDelivered: true
  }).then(() => {
    // console.log("OK 02")
  }).catch((err) => {
    console.log("Erro atualizarQuestaoAplicada. questionDocId: ", questionDocId, ". Erro ", err);
  });
  // return DatabaseReferences.question.doc(questionDocId).update({
  //   isDelivered: true
  // });
  // batch.update(DatabaseReferences.task.doc(questionDocId), { isDelivered: true });
}

function atualizarAplicarAplicada(exameId: any) {
  DatabaseReferences.exame.doc(exameId).update({
    isDelivered: false,
  }).then(() => {
    ////console.log("OK 02")
  }).catch((err) => {
    console.log("Erro atualizarAplicarAplicada. exameId: ", exameId, ". Erro ", err)
  });

  // return DatabaseReferences.exame.doc(exameId).update({
  //   isDelivered: false,
  // });

}

// function atualizarQuestionStudentApply(exameId: any, questionId: any, studentId: any) {
//   // let field = 'studentMap.',studentId;
//   DatabaseReferences.exame.doc(exameId).update({
//     // field: true
//     // 'studentMap.',studentId: true
//     // `studentMap.${studentId}`: true
//     [`studentMap.${studentId}`]: true,
//     [`questionMap.${questionId}`]: true
//   }).then(() => {
//     //console.log("Avaliacao: " + exameId + " Lista de usuarios atualizada")
//   }).catch((err) => {
//     console.log("Erro atualizarQuestionStudentApply. exameId: ", exameId, "questionId: ", questionId, "studentId: ", studentId, ". Erro ", err);
//   });
//   // return DatabaseReferences.exame.doc(exameId).update({
//   //   // field: true
//   //   // 'studentMap.',studentId: true
//   //   // `studentMap.${studentId}`: true
//   //   [`studentMap.${studentId}`]: true,
//   //   [`questionMap.${questionId}`]: true
//   // })
//   // batch.update(DatabaseReferences.task.doc(exameId), { [`studentMap.${studentId}`]: true, [`questionMap.${questionId}`]: true });

// }

function atualizarQuestionStudentApplyList(exameId: any, questionIdList: any, studentIdList: any) {
  console.log('atualizarQuestionStudentApplyList');
  let idsMap = new Map();
  questionIdList.forEach(async (idDoc: any, index: any, array: any) => {
    idsMap.set(`questionMap.${idDoc}`, true);
  });
  studentIdList.forEach(async (idDoc: any, index: any, array: any) => {
    idsMap.set(`studentMap.${idDoc}`, true);
  });
  let jsonResponse: any = {};
  for (let [key, val] of idsMap.entries()) {
    jsonResponse[key] = val;
  }
  // console.log('idsMap: ',idsMap);
  // console.log('jsonResponse: ',jsonResponse);
  // let field = 'studentMap.',studentId;
  DatabaseReferences.exame.doc(exameId).update(jsonResponse).then(() => {
    //console.log("Avaliacao: " + exameId + " Lista de usuarios atualizada")
  }).catch((err) => {
    console.log("Erro atualizarQuestionStudentApplyList. exameId: ", exameId, ". Erro ", err);
  });
  // return DatabaseReferences.exame.doc(exameId).update({
  //   // field: true
  //   // 'studentMap.',studentId: true
  //   // `studentMap.${studentId}`: true
  //   [`studentMap.${studentId}`]: true,
  //   [`questionMap.${questionId}`]: true
  // })
  // batch.update(DatabaseReferences.task.doc(exameId), { [`studentMap.${studentId}`]: true, [`questionMap.${questionId}`]: true });

}

/**
 * Funcao que dada um array de id-documentos e uma colection, retorna a lista de documents
 * @param listaIdsDocumentos - array de strings, contendo os id's dos documentos
 * @param collection - nome da collection onde sera feito a busca
 */
function getListaDocuments(listaIdsDocumentos: any, collection: any) {
  return new Promise((resolve, reject: any) => {
    let listaResultado: any = [];
    listaIdsDocumentos.forEach(async (idDoc: any, index: any, array: any) => {
      await DatabaseReferences.db.collection(collection).doc(idDoc).get().then((document) => {
        listaResultado.push(document);
      }).catch((err) => {
        console.log("getListaDocuments. Erro. Col.: " + collection + " Id: " + idDoc);
        reject("");
      })
      if ((index) + 1 >= array.length) {
        resolve(listaResultado);
      }
    });
  });
}


function getNumeroAleatorio(min: any, max: any) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
