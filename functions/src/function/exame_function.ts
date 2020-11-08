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
        ExameApply(docSnapShot.after);
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
    let exameData = exameSnapShot.data();
    let exameId = exameSnapShot.id;
    console.log("ExameApply exameId: " + exameId);

    //verificar se a condicao isDelivered esta true
    if (!exameData.isDelivered) { return 0; }
    atualizarAplicarAplicada(exameId);

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
        return iniciarProcessoAplicarAvaliacao(false, questionListNew, studentListNew, exameId, exameData);
    } else if (questionListApply.length > 0 && questionListNew.length > 0 && studentListApply.length > 0 && studentListNew.length == 0) {
        // CASO 02 - Questoes novas para todos os alunos ja aplicados (não há alunos novos )
        // questaoAppTrue=[a,b]   studentAppTrue=[1,2]
        // questaoNewFalse=[c,d]   studentListNewFalse=[]
        console.log("Process exame. CASO 02")
        return iniciarProcessoAplicarAvaliacao(false, questionListNew, studentListApply, exameId, exameData);
    } else if (questionListApply.length > 0 && questionListNew.length == 0 && studentListApply.length > 0 && studentListNew.length > 0) {
        // CASO 03 - Alunos novos para todas as questoes ja aplicadas (nao há questoes novas)
        // questaoAppTrue=[a,b]   studentAppTrue=[1,2]
        // questaoNewFalse=[]   studentListNewFalse=[3,4]
        console.log("Process exame. CASO 03")
        return iniciarProcessoAplicarAvaliacao(true, questionListApply, studentListNew, exameId, exameData);
    } else if (questionListApply.length > 0 && questionListNew.length > 0 && studentListApply.length > 0 && studentListNew.length > 0) {
        // CASO 04 - Novos questoes para novos alunos ( com questoes e alunos ja aplicados)
        // questaoAppTrue=[a,b]   studentAppTrue=[1,2]
        // questaoNewFalse=[c,d]   studentListNewFalse=[3,4]
        console.log("Process exame. CASO 04")
        // console.log("Process exame. CASO 04a - (questaoNewFalse->studentAppTrue)")
        iniciarProcessoAplicarAvaliacao(false, questionListNew, studentListApply, exameId, exameData);
        // console.log("Process exame. CASO 04b - (questaoNewFalse->studentListNewFalse)")
        iniciarProcessoAplicarAvaliacao(false, questionListNew, studentListNew, exameId, exameData);
        // console.log("Aplicando avaliacao. CASO 04c - (questaoAppTrue->studentListNewFalse)")
        iniciarProcessoAplicarAvaliacao(true, questionListApply, studentListNew, exameId, exameData);
        return 0;
    } else {
        // console.log("Aplicando avaliacao. Nenhuma condicao foi atingida");
        atualizarAplicarAplicada(exameId);
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
async function iniciarProcessoAplicarAvaliacao(questionIsDelivered: boolean, questionIdList: any, studentIdList: any, exameId: any, exameData: any) {
    console.log("iniciarProcessoAplicarAvaliacao. questionIdList.length = " + questionIdList.length)
    console.log("iniciarProcessoAplicarAvaliacao. studentIdList.length = " + studentIdList.length)
    // console.log("iniciarProcessoAplicarAvaliacao. exameId = " + exameId)
    let questionApplyList = new Set();
    let studentApplyList = new Set();
    let taskApplyList: any = [];
    // console.time('#iniciarProcessoAplicarAvaliacao');
    await DatabaseReferences.question.where('exameRef.id', '==', exameId).where('isDelivered', '==', questionIsDelivered).get().then((questionQuerySnapShot: FirebaseFirestore.QuerySnapshot) => {
        if (questionQuerySnapShot.empty) {
            atualizarAplicarAplicada(exameId);
        } else {
            questionQuerySnapShot.docs.forEach(async (questionDoc: any, index: any, array: any) => {
                //     questionQuerySnapShot.forEach(async (questionDoc: any) => {
                await aplicarQuestaoParaCadaAluno(questionDoc.id, questionDoc.data(), studentIdList, exameData, taskApplyList, questionApplyList, studentApplyList).then(() => {
                    // console.timeEnd('#aplicarQuestaoParaCadaAluno');
                    // console.log(msg);
                    // atualizarQuestaoAplicada(questionDoc.id);
                }).catch((error) => {
                    console.error("Erro aplicarListaQuestoesEmListaAlunos->DatabaseReferences.situation.", error);
                });
                if ((index) + 1 >= array.length) {
                    // [1...if] [2...if] [3...if] [4...if] [5...if]
                    // console.timeEnd('#getListaDocuments01');
                    // atualizarQuestionStudentApplyList(exameId, questionApplyList, studentApplyList);
                    committar(taskApplyList).then((msg: any) => {
                        console.log(msg);
                    });
                }
            });
        }
    }).catch((error) => { console.error('Error: getQuestionDocs.', error) });
}






function aplicarQuestaoParaCadaAluno(questionId: any, questionDoc: any, studentIdList: any, exameData: any, taskApplyList: any, questionApplyList: any, studentApplyList: any) {
    // console.time('#aplicarQuestaoParaCadaAluno');
    // console.log('aplicarQuestaoParaCadaAluno::questionId: ', questionId);
    return new Promise((resolve) => {
        studentIdList.forEach(async (studentId: any, index: any, array: any) => {
            await gerarSalvarNovoDocumentDeTarefa(questionId, questionDoc, studentId, exameData, questionApplyList, studentApplyList).then((task) => {
                // console.timeEnd('#gerarSalvarNovoDocumentDeTarefa');
                taskApplyList.push(task);
                // console.log('taskApplyList.size: ', taskApplyList.size);
            }).catch((e) => { console.error(e) });
            if ((index + 1) >= array.length) {
                resolve("aplicarQuestaoParaCadaAluno. resolve");
            }
        });
    })

}

function gerarSalvarNovoDocumentDeTarefa(questionId: any, questionDoc: any, studentId: any, exameData: any, questionApplyList: any, studentApplyList: any) {
    // console.time('#gerarSalvarNovoDocumentDeTarefa');
    return new Promise((resolve: any) => {
        // console.log('gerarSalvarNovoDocumentDeTarefa studentId: ', studentId);
        // console.log('gerarSalvarNovoDocumentDeTarefa questionDoc.id: ', questionDoc.id);
        // console.log('gerarSalvarNovoDocumentDeTarefa exameId: ', exameId);
        // console.log('gerarSalvarNovoDocumentDeTarefa questionDoc: ', questionDoc);
        // console.log('gerarSalvarNovoDocumentDeTarefa exameData: ', exameData);
        // console.log('gerarSalvarNovoDocumentDeTarefa questionDoc.situationModel: ', questionDoc.situationModel);

        let randomSituationKey = Object.keys(questionDoc.situationModel.simulationModel)[Math.floor(Math.random() * Object.keys(questionDoc.situationModel.simulationModel).length)]
        let input = {};
        if (questionDoc.situationModel.simulationModel[randomSituationKey].hasOwnProperty('input')) {
            input = questionDoc.situationModel.simulationModel[randomSituationKey].input;
        }
        let output = questionDoc.situationModel.simulationModel[randomSituationKey].output;
        // console.log('input: ', input);
        // console.log('output: ', output);

        let task = {
            teacherUserRef: exameData.userRef,
            classroomRef: questionDoc.classroomRef,
            exameRef: questionDoc.exameRef,
            questionRef: {
                id: questionId,
                name: questionDoc.name
            },
            situationRef: {
                id: questionDoc.situationModel.id,
                name: questionDoc.situationModel.name,
                url: questionDoc.situationModel.url,
            },
            studentUserRef: {
                id: exameData.studentUserRefMap[studentId].id,
                name: exameData.studentUserRefMap[studentId].name,
                // email: studentObj.email
                // foto: studentObj.foto.url != null ? studentObj.foto.url : null,
            },
            //dados do exame. mas pode ser alterado pela questao por isto pego da questao
            start: questionDoc.start,
            end: questionDoc.end,
            scoreExame: exameData.scoreExame,
            //dados da questao
            attempt: questionDoc.attempt,
            time: questionDoc.time,
            error: questionDoc.error,
            scoreQuestion: questionDoc.scoreQuestion,
            // gestão da questao
            attempted: 0,
            isOpen: true,
            simulationInput: input,
            simulationOutput: output,
        }

        questionApplyList.add(questionId);
        studentApplyList.add(exameData.studentUserRefMap[studentId].id);
        // return await batch.set(DatabaseReferences.task.doc(), task);
        resolve(task);
    });
}

// function atualizarQuestaoAplicada(questionDocId: any) {
//     console.log('atualizarQuestaoAplicada');
//     // console.time('#atualizarQuestaoAplicada');
//     DatabaseReferences.question.doc(questionDocId).update({
//         isDelivered: true
//     }).catch((err) => {
//         console.error("Erro atualizarQuestaoAplicada. questionDocId: ", questionDocId, ". Erro ", err);
//     });
//     // console.timeEnd('#atualizarQuestaoAplicada');
// }

function atualizarAplicarAplicada(exameId: any) {
    console.log('atualizarAplicarAplicada');
    // console.time('#atualizarAplicarAplicada');
    DatabaseReferences.exame.doc(exameId).update({
        isDelivered: false,
    }).catch((err) => {
        console.error("Erro atualizarAplicarAplicada. exameId: ", exameId, ". Erro ", err)
    });
    // console.timeEnd('#atualizarAplicarAplicada');
}


// function atualizarQuestionStudentApplyList(exameId: any, questionIdList: any, studentIdList: any) {
//     console.log('atualizarQuestionStudentApplyList');
//     // console.time('#atualizarQuestionStudentApplyList');

//     let idsMap = new Map();
//     questionIdList.forEach(async (idDoc: any) => {
//         idsMap.set(`questionMap.${idDoc}`, true);
//     });
//     studentIdList.forEach(async (idDoc: any) => {
//         idsMap.set(`studentMap.${idDoc}`, true);
//     });
//     let jsonResponse: any = {};
//     for (let [key, val] of idsMap.entries()) {
//         jsonResponse[key] = val;
//     }
//     DatabaseReferences.exame.doc(exameId).update(jsonResponse).catch((error) => {
//         console.error("Erro atualizarQuestionStudentApplyList. exameId: ", exameId, ". Erro ", error);
//     });
//     // console.timeEnd('#atualizarQuestionStudentApplyList');

// }


function committar(tasks: any) {
    console.log('committar: ', tasks.length);
    // console.time('#committar');
    return new Promise((resolve: any) => {
        let batch = DatabaseReferences.db.batch();
        tasks.forEach(async (taskItem: any, index: any, array: any) => {
            // console.log('committar index: ', index);
            batch.set(DatabaseReferences.task.doc(), taskItem);
            if ((index) + 1 >= array.length) {
                // console.timeEnd('#committar');
                batch.commit().then(function () {
                    console.log("batch.commit");
                });
                resolve('commitado');
            }
        });

    });
}
