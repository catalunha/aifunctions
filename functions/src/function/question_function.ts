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
    }
    if ((questionDocBeforeData.end as Timestamp).toDate().toLocaleString() != (questionDocAfterData.end as Timestamp).toDate().toLocaleString()) {
        //console.log("Questao.end alterado. Atualizando em: task.")
        DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'end': questionDocAfterData.end });
    }
    if (questionDocBeforeData.time != questionDocAfterData.time) {
        //console.log("Questao.time alterado. Atualizando em: task.")
        DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'time': questionDocAfterData.time });
    }
    if (questionDocBeforeData.attempt != questionDocAfterData.attempt) {
        //console.log("Questao.attempt alterado. Atualizando em: task.")
        DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'attempt': questionDocAfterData.attempt });
    }
    if (questionDocBeforeData.error != questionDocAfterData.error) {
        //console.log("Questao.error alterado. Atualizando em: task.")
        DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'error': questionDocAfterData.error });
    }
    if (questionDocBeforeData.scoreQuestion != questionDocAfterData.scoreQuestion) {
        //console.log("Questao.scoreQuestion alterado. Atualizando em: task.")
        DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'scoreQuestion': questionDocAfterData.scoreQuestion });
    }
    if (questionDocAfterData.resetTask) {
        //console.log("Questao.scoreQuestion alterado. Atualizando em: task.")
        DatabaseReferences.updateDocumentWhereEquals('task', 'questionRef.id', questionDocId, { 'started': null, 'lastSendAnswer': null, 'attempted': 0, 'isOpen': true });
        DatabaseReferences.updateDocumentById('question', questionDocId, { resetTask: false });
    }
    if (questionDocBeforeData.isDelivered == false && questionDocAfterData.isDelivered == true) {
        console.log("question.isDelivered false->true. Distribuindo questão");
        questionDeliver(questionSnapShot.after);
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


async function questionDeliver(questionSnapShot: any) {
    let question = questionSnapShot.data();
    let questionId = questionSnapShot.id;
    console.log("questionDeliver questionId: " + questionId);

    if (question.isDelivered) {
        setQuestionIsDelivered(questionId, true);
    } else {
        setQuestionIsDelivered(questionId, false);
        return 0;
    }

    let studentIdList: Array<string> = [];
    if (question.hasOwnProperty('studentUserRefMap')) {
        for (var [key, value] of Object.entries<any>(question.studentUserRefMap)) {
            if (!value.status) {
                studentIdList.push(key);
            }
        }
    }

    if (studentIdList.length > 0) {
        return startDeliverQuestion(studentIdList, questionId, question);
    } else {
        setQuestionIsDelivered(questionId, true);
        return 0;
    }

}


async function startDeliverQuestion(studentIdList: any, questionId: any, question: any) {
    console.log("startDeliverQuestion. studentIdList.length = " + studentIdList.length)

    await deliverForEachStudent(studentIdList, questionId, question).then((batch: any) => {
        batch.commit()
            .then(function () {
                console.log("questionDeliver batch.commit");
            })
            .catch((error: any) => {
                setQuestionIsDelivered(questionId, false);
                console.error("Erro startDeliverQuestion batch.commit().", error);
            });
    }).catch((error) => {
        setQuestionIsDelivered(questionId, false);
        console.error("Erro aplicarListaQuestoesEmListaAlunos->DatabaseReferences.situation.", error);
    });
}






function deliverForEachStudent(studentIdList: any, questionId: any, questionDoc: any) {
    // console.log('deliverForEachStudent');
    return new Promise((resolve) => {
        let batch = DatabaseReferences.db.batch();
        studentIdList.forEach(async (studentId: any, index: any, array: any) => {
            await assembleTask(studentId, questionId, questionDoc)
                .then((task) => {
                    batch.update(DatabaseReferences.question.doc(questionId), { [`studentUserRefMap.${studentId}.status`]: true });
                    batch.update(DatabaseReferences.exame.doc(questionDoc.exameRef.id), { [`questionMap.${questionId}`]: true });
                    batch.set(DatabaseReferences.task.doc(), task);
                }).catch((e) => {
                    setQuestionIsDelivered(questionId, false);
                    console.error(e)
                });
            if ((index + 1) >= array.length) {
                resolve(batch);
            }
        });
    })

}

function assembleTask(studentId: any, questionId: any, questionDoc: any) {
    // console.log('assembleTask');
    return new Promise((resolve: any) => {
        // console.log('assembleTask studentId: ', studentId);
        // console.log('assembleTask questionId: ', questionId);
        // console.log('assembleTask questionDoc: ', questionDoc);
        // console.log('assembleTask question: ', question);
        // console.log('assembleTask questionDoc.situationModel: ', questionDoc.situationModel);

        let randomSituationKey = Object.keys(questionDoc.situationModel.simulationModel)[Math.floor(Math.random() * Object.keys(questionDoc.situationModel.simulationModel).length)]
        let input = {};
        if (questionDoc.situationModel.simulationModel[randomSituationKey].hasOwnProperty('input')) {
            input = questionDoc.situationModel.simulationModel[randomSituationKey].input;
        }
        let output = questionDoc.situationModel.simulationModel[randomSituationKey].output;
        // console.log('input: ', input);
        // console.log('output: ', output);

        let task = {
            teacherUserRef: questionDoc.userRef,
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
                id: questionDoc.studentUserRefMap[studentId].id,
                name: questionDoc.studentUserRefMap[studentId].name,
                email: questionDoc.studentUserRefMap[studentId].email,
            },
            //dados do exame. mas pode ser alterado pela questao por isto pego da questao
            start: questionDoc.start,
            end: questionDoc.end,
            scoreExame: questionDoc.scoreExame,
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
        resolve(task);
    });
}



function setQuestionIsDelivered(questionId: any, value: boolean) {
    console.log('setQuestionIsDelivered');
    DatabaseReferences.question.doc(questionId).update({
        isDelivered: value,
    }).catch((err) => {
        console.error("Erro setQuestionIsDelivered. questionId: ", questionId, ". Erro ", err)
    });
}
