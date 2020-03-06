import DatabaseReferences from "../database-references";


// ON UPDATE

export function problemaOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  //console.log("problemaOnUpdate :: " + docId);

  if (docBeforeData.nome != docAfterData.nome) {
    //console.log("Problema.Nome alterado. Atualizando em: Simulacao.")
    DatabaseReferences.updateDocumentWhereEquals('Simulacao', 'problema.id', docId, { 'problema.nome': docAfterData.nome })
  } 
  return 0
}

export function problemaOnDelete(docSnapShot: any) {
  const docId = docSnapShot.id;
  //console.log("problemaOnDelete :: " + docId);
  //console.log("problemaOnDelete. Apagando Simulacao.");
  DatabaseReferences.deleteDocumentGeneric('Simulacao', 'problema.id', docId);
  return 0;
}

