import DatabaseReferences from "../database-references";
let admin = require('firebase-admin');
import { Timestamp } from "@google-cloud/firestore";


export function questaoOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  //console.log("questaoOnUpdate :: " + docId);

  if ((docBeforeData.inicio as Timestamp).toDate().toLocaleString() != (docAfterData.inicio as Timestamp).toDate().toLocaleString()) {
    //console.log("Questao.Inicio alterado. Atualizando em: Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'questao.id', docId, { 'inicio': docAfterData.inicio })
  }
  if ((docBeforeData.fim as Timestamp).toDate().toLocaleString() != (docAfterData.fim as Timestamp).toDate().toLocaleString()) {
    //console.log("Questao.fim alterado. Atualizando em: Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'questao.id', docId, { 'fim': docAfterData.fim })
  }
  if (docBeforeData.tempo != docAfterData.tempo) {
    //console.log("Questao.tempo alterado. Atualizando em: Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'questao.id', docId, { 'tempo': docAfterData.tempo })
  }
  if (docBeforeData.tentativa != docAfterData.tentativa) {
    //console.log("Questao.tentativa alterado. Atualizando em: Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'questao.id', docId, { 'tentativa': docAfterData.tentativa })
  }
  if (docBeforeData.erroRelativo != docAfterData.erroRelativo) {
    //console.log("Questao.erroRelativo alterado. Atualizando em: Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'questao.id', docId, { 'erroRelativo': docAfterData.erroRelativo })
  }
  if (docBeforeData.nota != docAfterData.nota) {
    //console.log("Questao.nota alterado. Atualizando em: Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'questao.id', docId, { 'questaoNota': docAfterData.nota })
  }

  return 0
}

export function questaoOnDelete(docSnapShot: any) {
  const docId = docSnapShot.id;
  //console.log("questaoOnDelete :: " + docId);
  //console.log("questaoOnDelete. Apagando Tarefa. Atualizando Avaliacao.");
  DatabaseReferences.deleteDocumentGeneric('Tarefa', 'questao.id', docId);
  DatabaseReferences.updateDocumentWhereArrayContains('Avaliacao', 'questaoAplicada', docId, { 'questaoAplicada': admin.firestore.FieldValue.arrayRemove(docId) });
  DatabaseReferences.updateDocumentWhereArrayContains('Avaliacao', 'questaoAplicadaFunction', docId, { 'questaoAplicadaFunction': admin.firestore.FieldValue.arrayRemove(docId) });
  return 0;
}

