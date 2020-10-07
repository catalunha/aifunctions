import DatabaseReferences from "../database-references";

export function fooOnCreate(docSnapShot: any) {
    // const docData = docSnapShot.data();
    const docId = docSnapShot.id;
  
    console.log("barOnCreate :: " + docId);
  

        //console.log("usuarioNovoOnCreate. Usuario ja existe. Atualizando Usuario.turma")
        DatabaseReferences.bar.doc(docId).set({
          name: docId,
        }, { merge: true })


  }