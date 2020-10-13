import * as admin from 'firebase-admin';

admin.initializeApp();
const databaseReferences = admin.firestore();

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


  /**
   * Atualizar uma documento específico de uma coleção com um json 
   * @param collectionName Coleção
   * @param documentId Documento
   * @param updateJsonData Dados no formato json
   */
  public static updateDocumentById(collectionName: any, documentId: any, updateJsonData: any) {
    console.log("updateDocumentById. Entrada Col.: " + collectionName + " field: " + documentId + " json" + updateJsonData);

    this.db.collection(collectionName).doc(documentId).update(updateJsonData).then(() => {
      console.log("updateDocumentById. Atualizado  Col.: " + collectionName + " id: " + documentId);

    }).catch((error: any) => {
      console.log("updateDocumentById. Error getting documents.  Col.: " + collectionName + " field: " + documentId + " json" + updateJsonData, error);
    })
  }

  /**
   * Filtra os documentos de uma coleção que atendem a query de == e atualiza campos naquele documento conforme json
   * @param collectionName Nome da coleção onde iniciar a busca
   * @param fieldName Nome do campo a ser referenciado no where ==
   * @param value valor para comparação
   * @param updateJsonData json com campo e valor a ser alterado naquele documento encontrado
   */
  public static updateDocumentWhereEquals(collectionName: any, fieldName: any, value: any, updateJsonData: any) {
    console.log("updateDocumentWhereEquals. Entrada Col.: " + collectionName + " field: " + fieldName + " value: " + value + " json" + updateJsonData);

    this.db.collection(collectionName).where(fieldName, '==', value).get().then((querySnapShot: any) => {
      if (querySnapShot.docs.length > 0) {
        querySnapShot.docs.forEach((docRef: any) => {
          this.db.collection(collectionName).doc(docRef.id).update(updateJsonData).then(() => {
            console.log("updateDocumentWhereEquals. Atualizado  Col.: " + collectionName + " id: " + docRef.id);
          })
        })
      }
    }).catch((error: any) => {
      console.log('updateDocumentWhereEquals. Error getting documents.  Col.: ' + collectionName + ' fieldName: ' + fieldName + ' value: ' + value, error)
    })
  }

  /**
   * Filtra os documentos de uma coleção que atendem a query de arrayContains e atualiza campos naquele documento conforme json
   * @param collectionName Nome da coleção onde iniciar a busca
   * @param fieldName Nome do campo a ser referenciado no arrayContains
   * @param value valor que o array contem para comparação
   * @param updateJsonData json com campo e valor a ser alterado naquele documento encontrado
   */
  public static updateDocumentWhereArrayContains(collectionName: any, fieldName: any, value: any, updateJsonData: any) {
    console.log("updateDocumentWhereArrayContains. Entrada Col.: " + collectionName + " field: " + fieldName + " value: " + value + " json" + updateJsonData);

    this.db.collection(collectionName).where(fieldName, 'array-contains', value).get().then((querySnapShot: any) => {
      if (querySnapShot.docs.length > 0) {
        querySnapShot.docs.forEach((docRef: any) => {
          this.db.collection(collectionName).doc(docRef.id).update(updateJsonData).then(() => {
            console.log("updateDocumentWhereArrayContains. Atualizado  Col.: " + collectionName + " id: " + docRef.id);
          })
        })
      }
    }).catch((error: any) => {
      console.log('updateDocumentWhereArrayContains. Error getting documents.  Col.: ' + collectionName + ' fieldName: ' + fieldName + ' value: ' + value, error)
    })
  }

  /**
   * 
   * @param collectionName Coleção
   * @param fieldName campo
   * @param value valor a ser filtrado para
   */
  public static deleteDocumentGeneric(collectionName: any, fieldName: any, value: any) {
    console.log("deleteDocumentGeneric. Entrada Col.: " + collectionName + " field: " + fieldName + " value: " + value);

    this.db.collection(collectionName).where(fieldName, '==', value).get().then((querySnapShot: any) => {
      if (querySnapShot.docs.length > 0) {
        querySnapShot.docs.forEach((docRef: any) => {
          this.db.collection(collectionName).doc(docRef.id).delete().then(() => {
            console.log("deleteDocumentGeneric. Deletado  Col.: " + collectionName + " id: " + docRef.id);
          })
        })
      }
    }).catch((error: any) => {
      console.log('deleteDocumentGeneric. Error getting documents.  Col.: ' + collectionName + ' fieldName: ' + fieldName + ' value: ' + value, error);
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
          [`studentUserRefMap.${newUser.uid}`]: {
            id: newUser.uid,
            code: userInfo.code,
            email: userInfo.email,
            name: userInfo.name,
          },
          // [`studentUserRefMapTemp.${userInfo.id}`]: admin.firestore.FieldValue.delete()
        }).then((doc) => {
          // console.log("OK 02")
        }).catch((err) => {
          //console.log("atualizarAplicarAplicada. exameId: " + exameId + ". Erro " + err)
        });
      }).catch(function (error: any) {
        console.log("addNewUser. Em atualizar classroom in studentUserRefMap:", error);
      });

    }).catch(function (error: any) {
      console.log("addNewUser. Error creating new user:", error);
    });
  }


}