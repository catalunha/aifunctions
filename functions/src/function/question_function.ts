import DatabaseReferences from "../database-references";
let admin = require('firebase-admin');
import { Timestamp } from "@google-cloud/firestore";


export function questionOnUpdate(questionSnapShot: any) {
  const questionDocBeforeData = questionSnapShot.before.data();
  const questionDocAfterData = questionSnapShot.after.data();
  const questionDocId = questionSnapShot.after.id;

  //console.log("questionRefOnUpdate :: " + questionDocId);
  if (questionDocBeforeData.name != questionDocAfterData.name) {
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'questionRef.name': questionDocAfterData.name });
  }
  if ((questionDocBeforeData.start as Timestamp).toDate().toLocaleString() != (questionDocAfterData.start as Timestamp).toDate().toLocaleString()) {
    //console.log("Questao.start alterado. Atualizando em: task.")
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'start': questionDocAfterData.start });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'started': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'lastSendAnswer': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'attempted': 0 });
  }
  if ((questionDocBeforeData.end as Timestamp).toDate().toLocaleString() != (questionDocAfterData.end as Timestamp).toDate().toLocaleString()) {
    //console.log("Questao.end alterado. Atualizando em: task.")
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'end': questionDocAfterData.end });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'started': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'lastSendAnswer': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'attempted': 0 });
  }
  if (questionDocBeforeData.time != questionDocAfterData.time) {
    //console.log("Questao.time alterado. Atualizando em: task.")
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'time': questionDocAfterData.time });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'started': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'lastSendAnswer': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'attempted': 0 });
  }
  if (questionDocBeforeData.attempt != questionDocAfterData.attempt) {
    //console.log("Questao.attempt alterado. Atualizando em: task.")
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'attempt': questionDocAfterData.attempt });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'started': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'lastSendAnswer': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'attempted': 0 });
  }
  if (questionDocBeforeData.error != questionDocAfterData.error) {
    //console.log("Questao.error alterado. Atualizando em: task.")
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'error': questionDocAfterData.error });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'started': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'lastSendAnswer': null });
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'attempted': 0 });
  }
  if (questionDocBeforeData.scoreQuestion != questionDocAfterData.scoreQuestion) {
    //console.log("Questao.scoreQuestion alterado. Atualizando em: task.")
    DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'scoreQuestion': questionDocAfterData.scoreQuestion });
  }

  return 0
}

export function questionOnDelete(questionSnapShot: any) {
  const questionDocId = questionSnapShot.id;
  const questionDocData = questionSnapShot.data();
  //console.log("questionRefOnDelete :: " + questionDocId);
  //console.log("questionRefOnDelete. Apagando task. Atualizando Avaliacao.");
  DatabaseReferences.deleteDocumentGeneric('task', 'questionRef.id', questionDocId);
  DatabaseReferences.updateDocumentById('exame', questionDocData.exameRef.id, { [`questionMap.${questionDocId}`]: admin.firestore.FieldValue.delete() })
  return 0;
}

