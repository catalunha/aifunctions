import admin = require('firebase-admin');
import functions = require('firebase-functions');

admin.initializeApp(functions.config().firebase);

let databaseReferences = admin.firestore();
// import * as admin from 'firebase-admin';

// admin.initializeApp();
// const databaseReferences = admin.firestore();

export default class DatabaseReferences {
  //referencia geral
  public static db = databaseReferences;

  //referencias auxiliares
  public static Usuario = databaseReferences.collection('Usuario');
  public static Avaliacao = databaseReferences.collection('Avaliacao');
  public static Questao = databaseReferences.collection('Questao');
  public static Problema = databaseReferences.collection('Problema');
  public static Simulacao = databaseReferences.collection('Simulacao');
  public static Tarefa = databaseReferences.collection('Tarefa');
  public static Turma = databaseReferences.collection('Turma');
  public static Upload = databaseReferences.collection('Upload');

  public static user = databaseReferences.collection('user');
  public static classroom = databaseReferences.collection('classroom');
  public static exame = databaseReferences.collection('exame');
  public static question = databaseReferences.collection('question');
  public static situation = databaseReferences.collection('situation');
  public static know = databaseReferences.collection('know');
  public static task = databaseReferences.collection('task');


  public static updateDocumentById(collectionName: any, documentId: any, updateJsonData: any) {
    console.log("updateDocumentById. Entrada Col.: " + collectionName + " field: " + documentId );

    this.db.collection(collectionName).doc(documentId).update(updateJsonData).then(() => {
      console.log("updateDocumentById. Atualizado  Col.: " + collectionName + " id: " + documentId);

    }).catch((error: any) => {
      console.log("updateDocumentById. Error getting documents.  Col.: " + collectionName + " field: " + documentId , error);
    })
  }
  // public static updateDocumentWhereEquals(collectionName: any, fieldName: any, documentId: any, updateJsonData: any) {
  //   console.log("updateDocumentWhereEquals. Entrada Col.: " + collectionName + " field: " + fieldName + ' documentId: ' + documentId + ' documentId: ' + updateJsonData);
  //   this.db.collection(collectionName).where(fieldName, '==', documentId).get().then((querySnapShot: any) => {
  //     console.log('updateDocumentWhereEquals', querySnapShot.docs.length);
  //     const chunk = (arr: string | any[], size: number) =>
  //       Array.from({ length: Math.ceil(arr.length / size) }, (_v, i) =>
  //         arr.slice(i * size, i * size + size)
  //       );
  //     console.log(chunk(querySnapShot.docs, 250).length);
  //     chunk(querySnapShot.docs, 250).forEach((docRef: any) => {
  //       let batch = DatabaseReferences.db.batch();
  //       docRef.forEach((docRef: any, index: any, array: any) => {
  //         batch.update(this.db.collection(collectionName).doc(docRef.id), updateJsonData);
  //         if ((index) + 1 >= array.length) {
  //           batch.commit().then(function () {
  //             batch = DatabaseReferences.db.batch();
  //             console.log("updateDocumentWhereEquals index:"+index+ " batch.commit Col.: " + collectionName + " field: " + fieldName + ' documentId: ' + documentId);
  //           });
  //         }
  //       });
 
  //     })
  //     // if (querySnapShot.docs.length > 0) {
  //     //   let batch = DatabaseReferences.db.batch();
  //     //   querySnapShot.docs.forEach((docRef: any, index: any, array: any) => {
  //     //     batch.update(this.db.collection(collectionName).doc(docRef.id), updateJsonData);
  //     //     if ((index) + 1 >= array.length) {
  //     //       batch.commit().then(function () {
  //     //         console.log("updateDocumentWhereEquals index:"+index+ " batch.commit Col.: " + collectionName + " field: " + fieldName + ' documentId: ' + documentId);
  //     //       });
  //     //     }
  //     //   })
  //     // }
  //   }).catch((error: any) => {
  //     console.log('updateDocumentWhereEquals. Error getting documents.  Col.: ' + collectionName + ' fieldName: ' + fieldName + ' documentId: ' + documentId, error)
  //   })
  // }

  public static updateDocumentWhereEquals(collectionName: any, fieldName: any, documentId: any, updateJsonData: any) {
    console.log("updateDocumentWhereEquals. Entrada Col.: " + collectionName + " field: " + fieldName + ' documentId: ' + documentId);

    this.db.collection(collectionName).where(fieldName, '==', documentId).get().then((querySnapShot: any) => {
      if (querySnapShot.docs.length > 0) {
        let batch = DatabaseReferences.db.batch();
        querySnapShot.docs.forEach((docRef: any, index: any, array: any) => {
          batch.update(this.db.collection(collectionName).doc(docRef.id), updateJsonData);
          if ((index) + 1 >= array.length) {
            batch.commit().then(function () {
              console.log("updateDocumentWhereEquals index:"+index+ " batch.commit Col.: " + collectionName + " field: " + fieldName + ' documentId: ' + documentId);
            });
          }
        })
      }
    }).catch((error: any) => {
      console.log('updateDocumentWhereEquals. Error getting documents.  Col.: ' + collectionName + ' fieldName: ' + fieldName + ' documentId: ' + documentId, error)
    })
  }

  public static updateDocumentWhereArrayContains(collectionName: any, fieldName: any, documentId: any, updateJsonData: any) {
    console.log("updateDocumentWhereArrayContains. Entrada Col.: " + collectionName + " field: " + fieldName + " documentId: " + documentId );

    this.db.collection(collectionName).where(fieldName, 'array-contains', documentId).get().then((querySnapShot: any) => {
      if (querySnapShot.docs.length > 0) {
        let batch = DatabaseReferences.db.batch();
        querySnapShot.docs.forEach((docRef: any, index: any, array: any) => {
          batch.update(this.db.collection(collectionName).doc(docRef.id), updateJsonData);
          if ((index) + 1 >= array.length) {
            batch.commit().then(function () {
              console.log("updateDocumentWhereArrayContains index:"+index+ " batch.commit Col.: " + collectionName + " field: " + fieldName + ' documentId: ' + documentId);
            });
          }
        })
      }
    }).catch((error: any) => {
      console.log('updateDocumentWhereArrayContains. Error getting documents.  Col.: ' + collectionName + ' fieldName: ' + fieldName + ' documentId: ' + documentId, error)
    })
  }

  public static deleteDocumentGeneric(collectionName: any, fieldName: any, documentId: any) {
    console.log("deleteDocumentGeneric. Entrada Col.: " + collectionName + " field: " + fieldName + " documentId: " + documentId);

    this.db.collection(collectionName).where(fieldName, '==', documentId).get().then((querySnapShot: any) => {
      if (querySnapShot.docs.length > 0) {
        let batch = DatabaseReferences.db.batch();
        querySnapShot.docs.forEach((docRef: any, index: any, array: any) => {
          batch.delete(this.db.collection(collectionName).doc(docRef.id));
          if ((index) + 1 >= array.length) {
            batch.commit().then(function () {
              console.log("deleteDocumentGeneric index:"+index+ " batch.commit Col.: " + collectionName + " field: " + fieldName + ' documentId: ' + documentId);
            });
          }
        })
      }
    }).catch((error: any) => {
      console.log('deleteDocumentGeneric. Error getting documents.  Col.: ' + collectionName + ' fieldName: ' + fieldName + ' documentId: ' + documentId, error);
    })
  }
  /**
   * Cria um novo documento na coleção Usuario
   * @param usuarioNovo Documento com os dados para criar um novo usuario
   */
  public static criarUsuario(usuarioNovo: any) {
    admin.auth().createUser({
      email: usuarioNovo.email,
      emailVerified: false,
      password: "aialuno",
    }).then(function (newUser: any) {

      console.log("criarUsuario. Usuario criado com sucesso. id: ", newUser.uid);

      DatabaseReferences.Usuario.doc(newUser.uid).set({
        ativo: usuarioNovo.ativo,
        email: usuarioNovo.email,
        matricula: usuarioNovo.matricula,
        nome: usuarioNovo.nome,
        rota: usuarioNovo.rota,
        turma: [usuarioNovo.turma],
        foto: usuarioNovo.foto,
        professor: false,
      })

    }).catch(function (error: any) {
      console.log("criarUsuario. Error creating new user:", error);
    });
  }

  public static addNewUser(userInfo: any, classroomId: any) {
    console.log('addNewUser 1: ', userInfo, classroomId);

    admin.auth().getUserByEmail(userInfo.email).then(user => {
      DatabaseReferences.user.doc(user.uid).set({
        // code: userInfo.code,
        email: userInfo.email,
        name: userInfo.name,
        isActive: true,
        isTeacher: false,
        classroomId: [classroomId],
      }).then(function () {
        DatabaseReferences.classroom.doc(classroomId).update({
          [`studentRef.${user.uid}`]: {
            id: user.uid,
            code: userInfo.code,
            email: userInfo.email,
            name: userInfo.name,
          },
        });
      });
    }).catch(error => {
      if (error.code === 'auth/user-not-found') {
        admin.auth().createUser({
          email: userInfo.email,
          password: "aialuno",
          emailVerified: false,
        }).then(function (newUser: any) {

          console.log("addNewUser 2: Usuario criado com sucesso. id: ", newUser.uid);

          DatabaseReferences.user.doc(newUser.uid).set({
            // code: userInfo.code,
            email: userInfo.email,
            name: userInfo.name,
            isActive: true,
            isTeacher: false,
            classroomId: [classroomId],
          }).then(function () {
            DatabaseReferences.classroom.doc(classroomId).update({
              [`studentRef.${newUser.uid}`]: {
                id: newUser.uid,
                code: userInfo.code,
                email: userInfo.email,
                name: userInfo.name,
              },
            });
          });

        }).catch(function (error: any) {
          console.log("addNewUser. Error creating new user:", error);
        });
      }
    });

  }
}