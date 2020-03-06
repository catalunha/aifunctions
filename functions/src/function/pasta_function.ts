import DatabaseReferences from "../database-references";

export function pastaOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  //console.log("pastaOnUpdate :: " + docId);

  if (docBeforeData.nome != docAfterData.nome) {
    //console.log("Pasta.Nome alterado. Atualizando em: Problema.")
    DatabaseReferences.updateDocumentWhereEquals('Problema', 'pasta.id', docId, { 'pasta.nome': docAfterData.nome })
  }
  return 0
}

export function pastaOnDelete(docSnapShot: any) {
  const docId = docSnapShot.id;
  //console.log("pastaOnDelete :: " + docId);
  //console.log("pastaOnDelete. Apagando Problema.");
  DatabaseReferences.deleteDocumentGeneric('Problema', 'pasta.id', docId);

  return 0;
}

