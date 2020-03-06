import DatabaseReferences from "../database-references";


// ON UPDATE

export function uploadOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;

  console.log("uploadOnUpdate :: " + docId);

  // if (docBeforeData.upload == false && docAfterData.upload == true && docAfterData.updateCollection.collection=='Usuario') {
    if (docBeforeData.upload == false && docAfterData.upload == true) {
      //console.log("upload.upload alterado. Atualizando em: Aluno.")
      let field: string = docAfterData.updateCollection.field as string;
    DatabaseReferences.updateDocumentById(docAfterData.updateCollection.collection, docAfterData.updateCollection.document, { [field] : docAfterData.url })
  } 
  return 0
}

// export function uploadOnDelete(docSnapShot: any) {
//   const docId = docSnapShot.id;
//   //console.log("uploadOnDelete :: " + docId);
//   //console.log("uploadOnDelete. Apagando Avaliacao | Encontro.");
//   DatabaseReferences.deleteDocumentGeneric('Avaliacao', 'turma.id', docId);
//   DatabaseReferences.deleteDocumentGeneric('Encontro', 'turma.id', docId);
//   return 0;
// }

