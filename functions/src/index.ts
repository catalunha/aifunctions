import * as functions from 'firebase-functions';

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase! AI with asyncRedux...");
// });

// // // foo
// import * as fooFunction from './function/foo_function';
// exports.fooOnCreate = functions.firestore.document('exame/{id}').onCreate(fooFunction.fooOnCreate);

// // Usuario
// import * as usuarioFunction from './function/usuario_function';
// exports.usuarioOnUpdate = functions.firestore.document('Usuario/{usuarioId}').onUpdate(usuarioFunction.usuarioOnUpdate);
// exports.usuarioOnDelete = functions.firestore.document('Usuario/{usuarioId}').onDelete(usuarioFunction.usuarioOnDelete);

// // UsuarioNovo
// import * as usuarioNovoFunction from './function/usuario_novo_function';
// exports.usuarioNovoOnCreate = functions.firestore.document('UsuarioNovo/{usuarioNovoId}').onCreate(usuarioNovoFunction.usuarioNovoOnCreate);

// // Turma
// import * as turmaFunction from './function/turma_function';
// exports.turmaOnUpdate = functions.firestore.document('Turma/{turmaId}').onUpdate(turmaFunction.turmaOnUpdate);
// exports.turmaOnDelete = functions.firestore.document('Turma/{avaliacaoId}').onDelete(turmaFunction.turmaOnDelete);

// // Avaliacao
// import * as avaliacaoFunction from './function/avaliacao_function';
// exports.avaliacaoOnUpdate = functions.firestore.document('Avaliacao/{avaliacaoId}').onUpdate(avaliacaoFunction.avaliacaoOnUpdate);
// exports.avaliacaoOnDelete = functions.firestore.document('Avaliacao/{avaliacaoId}').onDelete(avaliacaoFunction.avaliacaoOnDelete);

// // Questao
// import * as questaoFunction from './function/questao_function';
// exports.questaoOnUpdate = functions.firestore.document('Questao/{questaoId}').onUpdate(questaoFunction.questaoOnUpdate);
// exports.questaoOnDelete = functions.firestore.document('Questao/{questaoId}').onDelete(questaoFunction.questaoOnDelete);

// // Pasta
// import * as pastaFunction from './function/pasta_function';
// exports.pastaOnUpdate = functions.firestore.document('Pasta/{pastaId}').onUpdate(pastaFunction.pastaOnUpdate);
// exports.pastaOnDelete = functions.firestore.document('Pasta/{pastaId}').onDelete(pastaFunction.pastaOnDelete);

// // Problema
// import * as problemaFunction from './function/problema_function';
// exports.problemaOnUpdate = functions.firestore.document('Problema/{problemaId}').onUpdate(problemaFunction.problemaOnUpdate);
// exports.problemaOnDelete = functions.firestore.document('Problema/{problemaId}').onDelete(problemaFunction.problemaOnDelete);

// // Upload
// import * as uploadFunction from './function/upload_function';
// exports.uploadOnUpdate = functions.firestore.document('Upload/{uploadId}').onUpdate(uploadFunction.uploadOnUpdate);


// // Relatorio2Csv
// import * as relatorioFunction from './function/relatorio_function';
// exports.relatorioOnRequest =  functions.https.onRequest(relatorioFunction.app);


// AI com AsyncRedux e em ingles

// // Collection exame
// ffirebase deploy --only functions:exameOnUpdate,functions:exameOnDelete
import * as exameFunction from './function/exame_function';
exports.exameOnUpdate = functions.firestore.document('exame/{exameId}').onUpdate(exameFunction.exameOnUpdate);
exports.exameOnDelete = functions.firestore.document('exame/{exameId}').onDelete(exameFunction.exameOnDelete);

// Collection question
// firebase deploy --only functions:questionOnUpdate,functions:questionOnDelete
import * as questionFunction from './function/question_function';
exports.questionOnUpdate = functions.firestore.document('question/{questionId}').onUpdate(questionFunction.questionOnUpdate);
exports.questionOnDelete = functions.firestore.document('question/{questionId}').onDelete(questionFunction.questionOnDelete);

// // Collection classroom
// // firebase deploy --only functions:classroomOnUpdate,functions:classroomOnDelete
// import * as classroomFunction from './function/classroom_function';
// exports.classroomOnUpdate = functions.firestore.document('classroom/{classroomId}').onUpdate(classroomFunction.classroomOnUpdate);
// exports.classroomOnDelete = functions.firestore.document('classroom/{avaliacaoId}').onDelete(classroomFunction.classroomOnDelete);

// // Collection user
// // firebase deploy --only functions:userOnUpdate,functions:userOnDelete
// import * as userFunction from './function/user_function';
// exports.userOnUpdate = functions.firestore.document('user/{userId}').onUpdate(userFunction.userOnUpdate);
// exports.userOnDelete = functions.firestore.document('user/{avaliacaoId}').onDelete(userFunction.userOnDelete);


// Collection situation
// firebase deploy --only functions:situationOnUpdate,functions:situationOnDelete
import * as situationFunction from './function/situation_function';
exports.situationOnUpdate = functions.firestore.document('situation/{situationId}').onUpdate(situationFunction.situationOnUpdate);
exports.situationOnDelete = functions.firestore.document('situation/{avaliacaoId}').onDelete(situationFunction.situationOnDelete);