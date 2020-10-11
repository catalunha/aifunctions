import DatabaseReferences from "../database-references";
// import { Timestamp } from "@google-cloud/firestore";

export function situationOnUpdate(situationSnapShot: any) {
    const situationBeforeData = situationSnapShot.before.data();
    const situationAfterData = situationSnapShot.after.data();
    const situationId = situationSnapShot.after.id;
    console.log('situationOnUpdate', situationId);
    if (situationBeforeData.name != situationAfterData.name) {
        //console.log("Avaliacao.Nome alterado. " + docBeforeData.nome + "!=" + docAfterData.nome + " .Atualizando em: Questao | Tarefa.");
        DatabaseReferences.updateDocumentWhereEquals('question', 'situationRef.id', situationId, { 'situationRef.name': situationAfterData.name });
        DatabaseReferences.updateDocumentWhereEquals('task', 'situationRef.id', situationId, { 'situationRef.name': situationAfterData.name });
        getAllDocsKnow(situationId, 'name', situationAfterData.name);
    }
    if (situationBeforeData.url != situationAfterData.url) {
        //console.log("Avaliacao.Nome alterado. " + docBeforeData.nome + "!=" + docAfterData.nome + " .Atualizando em: Questao | Tarefa.");
        DatabaseReferences.updateDocumentWhereEquals('question', 'situationRef.id', situationId, { 'situationRef.url': situationAfterData.url });
        DatabaseReferences.updateDocumentWhereEquals('task', 'situationRef.id', situationId, { 'situationRef.url': situationAfterData.url });
        getAllDocsKnow(situationId, 'url', situationAfterData.url);

    }

    return 0
}
async function getAllDocsKnow(situationId: any, fieldName: any, fieldValue: any) {
    const refDocsKnow = DatabaseReferences.db.collection('know');
    refDocsKnow.get().then((docsKnowSnapshot) => {
        docsKnowSnapshot.docs.forEach((doc) => {
            console.log('Processando: ', doc.id);
            //    tempDoc.push({ id: doc.id, ...doc.data() })
            updateKnow(doc.id, doc.data(), situationId, fieldName, fieldValue);
        })
    })
}

function updateKnow(knowId: any, knowData: any, situationId: any, fieldName: any, fieldValue: any) {
    console.log('updateKnow: ', 'knowId: ', knowId, 'situationId', situationId);
    // console.log('updateKnow: ', 'knowId: ', knowId, 'knowData: ', knowData);
    // console.log('knowData.folderMap.name:', knowData.folderMap.name);
    if (Object.keys(knowData.folderMap).length !== 0) {
        Object.entries(knowData.folderMap).forEach(([keyFolderMap, valueFolderMap]: any) => {
            // console.log(valueFolderMap.situationRefMap);
            // console.log(Object.keys(valueFolderMap.situationRefMap).length !== 0);
            if (Object.keys(valueFolderMap.situationRefMap).length !== 0) {
                Object.entries(valueFolderMap.situationRefMap).forEach(([keySituationRefMap, valueSituationRefMap]: any) => {
                    if (keySituationRefMap === situationId) {
                        console.log(`folderMap.${keyFolderMap}.situationRefMap.${keySituationRefMap}.name`, 'value');
                        DatabaseReferences.know.doc(knowId).update({
                            [`folderMap.${keyFolderMap}.situationRefMap.${keySituationRefMap}.${fieldName}`]: fieldValue,
                        });
                    }
                });
            }
        });
    }
    //   if (knowData.hasOwnProperty('folderMap')) {
    //     for (let [keyFolderMap, valueFolderMap] of Object.entries(knowData.folderMap)){
    //         console.log('keyFolderMap: ', keyFolderMap);
    //         console.log('valueFolderMap:', valueFolderMap);
    //         // console.log('valueFolderMap.name:', valueFolderMap.name);
    //         // console.log('updateKnow: ', knowId, ' keyFolderMap: ', keyFolderMap);

    //         // if (valueFolderMap.situationRefMap !== null) {
    //         //     // if (valueFolderMap.hasOwnProperty('situationRefMap')) {
    //         //     for (let [keySituationRefMap, valueSituationRefMap] of Object.entries(valueFolderMap.situationRefMap)) {
    //         //         console.log(valueSituationRefMap);
    //         //         if (fieldName === 'name') {
    //         //             DatabaseReferences.know.doc(knowId).update({
    //         //                 [`folderMap.${keyFolderMap}.situationMap.${keySituationRefMap}.name`]: fieldValue,
    //         //             });
    //         //         } else if (fieldName === 'url') {
    //         //             DatabaseReferences.know.doc(knowId).update({
    //         //                 [`folderMap.${keyFolderMap}.situationMap.${keySituationRefMap}.url`]: fieldValue,
    //         //             });
    //         //         }
    //         //     }
    //         // }
    //     }
    // }
    // knowData.folderMap.forEach(([keyFolderMap, valueFolderMap]: any) => {
    //     if (valueFolderMap.situationMap !== null) {
    //         valueFolderMap.situationMap.forEach(([keySituationRefMap, valueSituationRefMap]: any) => {
    //             console.log(`folderMap.${keyFolderMap}.situationMap.${keySituationRefMap}.${fieldName}`, fieldValue);
    //             DatabaseReferences.know.doc(knowId).update({
    //                 [`folderMap.${keyFolderMap}.situationMap.${keySituationRefMap}.${fieldName}`]: fieldValue,
    //             });
    //             // if (fieldName === 'name') {
    //             //     DatabaseReferences.know.doc(knowId).update({
    //             //         [`folderMap.${keyFolderMap}.situationMap.${keySituationRefMap}.name`]: fieldValue,
    //             //     });
    //             // } else if (fieldName === 'url') {
    //             //     DatabaseReferences.know.doc(knowId).update({
    //             //         [`folderMap.${keyFolderMap}.situationMap.${keySituationRefMap}.url`]: fieldValue,
    //             //     });
    //             // }
    //         });
    //     }
    // });

}

export function situationOnDelete(situationSnapShot: any) {
    const situationId = situationSnapShot.id;
    console.log('situationOnDelete', situationId);
    DatabaseReferences.deleteDocumentGeneric('question', 'situationRef.id', situationId);
    DatabaseReferences.deleteDocumentGeneric('task', 'situationRef.id', situationId);
    return 0;
}