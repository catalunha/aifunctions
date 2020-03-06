import DatabaseReferences from "../database-references";
import { Timestamp } from "@google-cloud/firestore";

export function avaliacaoOnUpdate(docSnapShot: any) {
  const docBeforeData = docSnapShot.before.data();
  const docAfterData = docSnapShot.after.data();
  const docId = docSnapShot.after.id;
  //console.log("avaliacaoOnUpdate. id: " + docId);
  if (docBeforeData.nome != docAfterData.nome) {
    //console.log("Avaliacao.Nome alterado. " + docBeforeData.nome + "!=" + docAfterData.nome + " .Atualizando em: Questao | Tarefa.");
    DatabaseReferences.updateDocumentWhereEquals('Questao', 'avaliacao.id', docId, { 'avaliacao.nome': docAfterData.nome });
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'avaliacao.id', docId, { 'avaliacao.nome': docAfterData.nome });
  }
  if ((docBeforeData.inicio as Timestamp).toDate().toLocaleString() != (docAfterData.inicio as Timestamp).toDate().toLocaleString()) {
    //console.log("Avaliacao.Inicio alterado?. " + (docBeforeData.inicio as Timestamp).toDate() + "!=" + (docAfterData.inicio as Timestamp).toDate() + " .Atualizando em: Questao | Tarefa.")
    //console.log("Avaliacao.Inicio alterado?. " + (docBeforeData.inicio as Timestamp).toDate().toLocaleString() + "!=" + (docAfterData.inicio as Timestamp).toDate().toLocaleString() + " .Atualizando em: Questao | Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Questao', 'avaliacao.id', docId, { 'inicio': docAfterData.inicio });
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'avaliacao.id', docId, { 'inicio': docAfterData.inicio });
  }
  if ((docBeforeData.fim as Timestamp).toDate().toLocaleString() != (docAfterData.fim as Timestamp).toDate().toLocaleString()) {
    //console.log("Avaliacao.fim alterado. " + (docBeforeData.fim as Timestamp).toDate().toLocaleString() + "!=" + (docAfterData.fim as Timestamp).toDate().toLocaleString() + " .Atualizando em: Questao | Tarefa.")
    DatabaseReferences.updateDocumentWhereEquals('Questao', 'avaliacao.id', docId, { 'fim': docAfterData.fim });
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'avaliacao.id', docId, { 'fim': docAfterData.fim });
  }
  if (docBeforeData.nota != docAfterData.nota) {
    //console.log("Avaliacao.nota alterado. " + docBeforeData.nota + "!=" + docAfterData.nota + " .Atualizando em: Tarefa.");
    DatabaseReferences.updateDocumentWhereEquals('Tarefa', 'avaliacao.id', docId, { 'avaliacaoNota': docAfterData.nota });
  }
  if (docBeforeData.aplicar == false && docAfterData.aplicar == true) {
    console.log("Avaliacao.aplicar false->true. Aplicando avaliação");
    aplicarAvaliacao(docSnapShot);
  }
  return 0
}

export function avaliacaoOnDelete(docSnapShot: any) {
  const docId = docSnapShot.id;
  //console.log("avaliacaoOnDelete. id: " + docId);
  //console.log("avaliacaoOnDelete. Apagando Questao.");
  DatabaseReferences.deleteDocumentGeneric('Questao', 'avaliacao.id', docId);
  return 0;
}



async function aplicarAvaliacao(snap: any) {

  // Marcador para referenciar se a lista de alunos aplicados ou questoes aplicadas vai ser atualizada
  let marcadorAtualizacao = {
    atualizarListaQuestoes: false,
    atualizarListaAlunos: false
  }

  let dataAntes = snap.before.data();
  let dataDepois = snap.after.data();
  let id = snap.after.id;

  //verificar se a condicao aplicado esta true
  if (!dataDepois.aplicar) { return 0; }

  //console.log("Aplicando avaliacao. id: " + id);

  let listaQuestoesNovas: any = false;
  if (dataDepois.questaoAplicadaFunction !== null) {
    listaQuestoesNovas = dataDepois.questaoAplicada.filter((item: any) => dataDepois.questaoAplicadaFunction.indexOf(item) < 0);
  }

  let listaAlunosNovos: any = false;
  if (dataDepois.aplicadaPAlunoFunction !== null) {
    listaAlunosNovos = dataDepois.aplicadaPAluno.filter((item: any) => dataDepois.aplicadaPAlunoFunction.indexOf(item) < 0)
  }

  if (
    (dataDepois.questaoAplicadaFunction === null || dataDepois.questaoAplicadaFunction.length == 0) &&
    (dataDepois.aplicadaPAlunoFunction === null || dataDepois.aplicadaPAlunoFunction.length == 0)
  ) {
    // CASO 01 - todas os questoes para todos os alunos ( todos os aluno para todas as questoes )
    //console.log("Aplicando avaliacao. CASO 01")
    marcadorAtualizacao.atualizarListaAlunos = true;
    marcadorAtualizacao.atualizarListaQuestoes = true;
    //console.log("Aplicando avaliacao. CASO 01. dataDepois.questaoAplicada = " + dataDepois.questaoAplicada);
    //console.log("Aplicando avaliacao. CASO 01. dataDepois.aplicadaPAluno = " + dataDepois.aplicadaPAluno);
    //console.log("Aplicando avaliacao. CASO 01. dataDepois.questaoAplicadaFunction = " + dataDepois.questaoAplicadaFunction);
    //console.log("Aplicando avaliacao. CASO 01. dataDepois.aplicadaPAlunoFunction = " + dataDepois.aplicadaPAlunoFunction);
    //console.log("Aplicando avaliacao. CASO 01. marcadorAtualizacao.atualizarListaAlunos = " + marcadorAtualizacao.atualizarListaAlunos);
    //console.log("Aplicando avaliacao. CASO 01. marcadorAtualizacao.atualizarListaQuestoes = " + marcadorAtualizacao.atualizarListaQuestoes);
    return iniciarProcessoAplicarAvaliacao(dataDepois.questaoAplicada, dataDepois.aplicadaPAluno, id, dataDepois, marcadorAtualizacao);

  } else if (
    (listaQuestoesNovas && listaQuestoesNovas.length > 0) &&
    (dataDepois.aplicadaPAlunoFunction === null || listaAlunosNovos.length == 0)
  ) {
    // CASO 02 - Questoes novas para todos os alunos
    //console.log("Aplicando avaliacao. CASO 02")
    marcadorAtualizacao.atualizarListaQuestoes = true;
    //console.log("Aplicando avaliacao. CASO 02. dataDepois.questaoAplicada = " + dataDepois.questaoAplicada);
    //console.log("Aplicando avaliacao. CASO 02. dataDepois.aplicadaPAluno = " + dataDepois.aplicadaPAluno);
    //console.log("Aplicando avaliacao. CASO 02. dataDepois.questaoAplicadaFunction = " + dataDepois.questaoAplicadaFunction);
    //console.log("Aplicando avaliacao. CASO 02. dataDepois.aplicadaPAlunoFunction = " + dataDepois.aplicadaPAlunoFunction);
    //console.log("Aplicando avaliacao. CASO 02. listaQuestoesNovas = " + listaQuestoesNovas);
    //console.log("Aplicando avaliacao. CASO 02. listaAlunosNovos = " + listaAlunosNovos);
    //console.log("Aplicando avaliacao. CASO 02. marcadorAtualizacao.atualizarListaAlunos = " + marcadorAtualizacao.atualizarListaAlunos);
    //console.log("Aplicando avaliacao. CASO 02. marcadorAtualizacao.atualizarListaQuestoes = " + marcadorAtualizacao.atualizarListaQuestoes);
    return iniciarProcessoAplicarAvaliacao(listaQuestoesNovas, dataDepois.aplicadaPAluno, id, dataDepois, marcadorAtualizacao);

  } else if ((dataDepois.questaoAplicadaFunction === null || listaQuestoesNovas.length == 0) && (listaAlunosNovos && listaAlunosNovos.length > 0)) {
    // CASO 03 - Alunos novos para todas as questoes
    //console.log("Aplicando avaliacao. CASO 03")
    marcadorAtualizacao.atualizarListaAlunos = true;
    //console.log("Aplicando avaliacao. CASO 03. dataDepois.questaoAplicada = " + dataDepois.questaoAplicada);
    //console.log("Aplicando avaliacao. CASO 03. dataDepois.aplicadaPAluno = " + dataDepois.aplicadaPAluno);
    //console.log("Aplicando avaliacao. CASO 03. dataDepois.questaoAplicadaFunction = " + dataDepois.questaoAplicadaFunction);
    //console.log("Aplicando avaliacao. CASO 03. dataDepois.aplicadaPAlunoFunction = " + dataDepois.aplicadaPAlunoFunction);
    //console.log("Aplicando avaliacao. CASO 03. listaQuestoesNovas = " + listaQuestoesNovas);
    //console.log("Aplicando avaliacao. CASO 03. listaAlunosNovos = " + listaAlunosNovos);
    //console.log("Aplicando avaliacao. CASO 03. marcadorAtualizacao.atualizarListaAlunos = " + marcadorAtualizacao.atualizarListaAlunos);
    //console.log("Aplicando avaliacao. CASO 03. marcadorAtualizacao.atualizarListaQuestoes = " + marcadorAtualizacao.atualizarListaQuestoes);
    return iniciarProcessoAplicarAvaliacao(dataDepois.questaoAplicada, listaAlunosNovos, id, dataDepois, marcadorAtualizacao);

  } else if ((listaQuestoesNovas && listaQuestoesNovas.length > 0) && (listaAlunosNovos && listaAlunosNovos.length > 0)) {
    // CASO 04 - novos alunos para questoes, e novas questoes para alunos.
    //console.log("Aplicando avaliacao. CASO 04")
    //console.log("Aplicando avaliacao. CASO 04. dataDepois.questaoAplicada = " + dataDepois.questaoAplicada);
    //console.log("Aplicando avaliacao. CASO 04. dataDepois.aplicadaPAluno = " + dataDepois.aplicadaPAluno);
    //console.log("Aplicando avaliacao. CASO 04. dataDepois.questaoAplicadaFunction = " + dataDepois.questaoAplicadaFunction);
    //console.log("Aplicando avaliacao. CASO 04. dataDepois.aplicadaPAlunoFunction = " + dataDepois.aplicadaPAlunoFunction);
    //console.log("Aplicando avaliacao. CASO 04. listaQuestoesNovas = " + listaQuestoesNovas);
    //console.log("Aplicando avaliacao. CASO 04. listaAlunosNovos = " + listaAlunosNovos);
    //console.log("Aplicando avaliacao. CASO 04. marcadorAtualizacao.atualizarListaAlunos = " + marcadorAtualizacao.atualizarListaAlunos);
    //console.log("Aplicando avaliacao. CASO 04. marcadorAtualizacao.atualizarListaQuestoes = " + marcadorAtualizacao.atualizarListaQuestoes);

    let marcadorAtualizacao1 = {
      atualizarListaQuestoes: true,
      atualizarListaAlunos: false
    }
    iniciarProcessoAplicarAvaliacao(listaQuestoesNovas, dataAntes.aplicadaPAluno, id, dataDepois, marcadorAtualizacao1);

    let marcadorAtualizacao2 = {
      atualizarListaQuestoes: false,
      atualizarListaAlunos: true
    }
    iniciarProcessoAplicarAvaliacao(dataAntes.questaoAplicadaFunction, listaAlunosNovos, id, dataDepois, marcadorAtualizacao2);
    return 0;

  } else {
    //console.log("Aplicando avaliacao. Nenhuma condicao foi atingida");
    atualizarAplicarAplicada(id);

    return 0;

  }
}


/**
 * Funcao que percorre lista de questoes e aplica cada questao para um aluno
 * @param listaQuestoes 
 * @param listaAlunos 
 * @param avaliacaoId 
 * @param avaliacaoData 
 * @param marcadorAtualizacao 
 */
async function iniciarProcessoAplicarAvaliacao(listaQuestoes: any, listaAlunos: any, avaliacaoId: any, avaliacaoData: any, marcadorAtualizacao: any) {

  //console.log("Aplicando avaliacao. listaQuestoes.length = " + listaQuestoes.length)
  //pegar lista de documents de questoes
  await getListaDocuments(listaQuestoes, 'Questao').then(async (listaQuestoesFiltrada) => {
    //pegar a lista de documents de alunos
    await getListaDocuments(listaAlunos, 'Usuario').then(async (listaAlunosFiltrada) => {
      //aplicar questao para cada aluno
      await aplicarListaQuestoesEmListaAlunos(listaAlunosFiltrada, listaQuestoesFiltrada, avaliacaoId, avaliacaoData, marcadorAtualizacao).then((msg) => {
        //console.log(msg);

        //Atualizar lista aplicadaPAlunoFunction, questaoAplicadaFunction
        if (marcadorAtualizacao.atualizarListaQuestoes) { atualizarListaQuestoesAplicados(avaliacaoData.questaoAplicada, avaliacaoId) }
        if (marcadorAtualizacao.atualizarListaAlunos) { atualizarListaUsuariosAplicados(avaliacaoData.aplicadaPAluno, avaliacaoId) }

      });
      //TODOCriar function que passando lista de alunos e lista de questionario adicione-os a lista de aplicados
    }).catch(err => { return 0 })
  }).catch(err => { return 0 })

}

/**
 * Funcao que recebe lista de anlunos, lista de questao e aplica avaliacao, fazendo as relacoes de alunos com questoes
 * @param listaAlunos 
 * @param listaQuestoes 
 * @param avaliacaoData 
 * @param avaliacaoId 
 */
function aplicarListaQuestoesEmListaAlunos(listaAlunos: any, listaQuestoes: any, avaliacaoId: any, avaliacaoData: any, marcadorAtualizacao: any) {
  return new Promise((resolve, reject) => {
    listaQuestoes.forEach(async (questao: any, index: any, array: any) => {
      let quetaoData = questao.data()
      await DatabaseReferences.Simulacao.where('problema.id', '==', quetaoData.problema.id).get().then(async (listaSimulacao) => {
        // console.log("Quantidade situacoes >> " + listaSimulacao.docs.length)
        // para cada questao aplicar para lista de alunos
        await aplicarTarefaParaCadaAluno(listaAlunos, questao, avaliacaoId, avaliacaoData, listaSimulacao.docs, marcadorAtualizacao).then(() => {
          // Atualizar campo aplicar, aplicado na avaliacao
          atualizarAplicarAplicada(avaliacaoId);
        });
      })
      if ((index + 1) >= array.length) {
        resolve("Fim da aplicacao de tarefas");
      }
    });
  })
}

function aplicarTarefaParaCadaAluno(listaAlunos: any, questao: any, avaliacaoId: any, avaliacaoData: any, simulacaoLista: any, marcadorAtualizacao: any) {
  return new Promise((resolve, reject) => {
    listaAlunos.forEach((aluno: any, index: any, array: any) => {
      // console.log("simulacaoLista.length:"+simulacaoLista.length)//+" simulacaoLista : " + simulacaoLista)
      let simulacaoNumero = getNumeroAleatorio(0, simulacaoLista.length - 1);
      // console.log("ProblemaNum : " + simulacaoNumero)// + " Lista: " + simulacaoLista[simulacaoNumero])
      gerarSalvarNovoDocumentDeTarefa(aluno, questao, avaliacaoId, avaliacaoData, simulacaoLista[simulacaoNumero], marcadorAtualizacao)
      if ((index + 1) >= array.length) {
        resolve("Fim de percorrer lista de alunos");
      }
    });
  })

}

function gerarSalvarNovoDocumentDeTarefa(aluno: any, questao: any, avaliacaoId: any, avaliacaoData: any, simulacao: any, marcadorAtualizacao: any) {
  let tarefa = {
    aluno: {
      foto: aluno.data().foto.url != null ? aluno.data().foto.url : null,
      id: aluno.id,
      nome: aluno.data().nome
    },
    avaliacao: {
      id: avaliacaoId,
      nome: avaliacaoData.nome
    },
    questao: {
      id: questao.id,
      numero: questao.data().numero
    },
    simulacao: {
      id: simulacao.id,
      nome: simulacao.data().nome
    },
    turma: avaliacaoData.turma,
    professor: avaliacaoData.professor,
    problema: questao.data().problema,
    variavel: simulacao.data().variavel,
    gabarito: simulacao.data().gabarito,
    aberta: true,
    inicio: avaliacaoData.inicio,
    fim: avaliacaoData.fim,
    tempo: questao.data().tempo,
    tentativa: questao.data().tentativa,
    erroRelativo: questao.data().erroRelativo,
    questaoNota: questao.data().nota,
    avaliacaoNota: avaliacaoData.nota,
  }

  DatabaseReferences.Tarefa.doc().set(tarefa).then(() => {
    //console.log("Nova tarefa salva >> ")
    atualizarQuestaoAplicada(questao.id);
  }).catch((Err) => {
    //console.log("Erro ao salvar nova tarefa >> " + Err)
  })
}

function atualizarQuestaoAplicada(questaoID: any) {
  DatabaseReferences.Questao.doc(questaoID).set({
    aplicada: true
  }, { merge: true }).then(() => {
    ////console.log("OK 02")
  }).catch((err) => {
    //console.log("atualizarQuestaoAplicada. questaoID: " + questaoID + ". Erro " + err)
  })
}

function atualizarAplicarAplicada(avaliacaoId: any) {
  DatabaseReferences.Avaliacao.doc(avaliacaoId).set({
    aplicar: false,
    aplicada: true
  }, { merge: true }).then(() => {
    ////console.log("OK 02")
  }).catch((err) => {
    //console.log("atualizarAplicarAplicada. avaliacaoId: " + avaliacaoId + ". Erro " + err)
  })
}



function atualizarListaUsuariosAplicados(listaUsuarios: any, avaliacaoId: any) {
  DatabaseReferences.Avaliacao.doc(avaliacaoId).set({
    aplicadaPAlunoFunction: listaUsuarios
  }, { merge: true }).then(() => {
    //console.log("Avaliacao: " + avaliacaoId + " Lista de usuarios atualizada")
  }).catch((err) => {
    //console.log("Err 02 " + err)
  })
}


function atualizarListaQuestoesAplicados(listaQuestoes: any, avaliacaoId: any) {
  DatabaseReferences.Avaliacao.doc(avaliacaoId).set({
    questaoAplicadaFunction: listaQuestoes
  }, { merge: true }).then(() => {
    //console.log("Avaliacao: " + avaliacaoId + " Lista de questoes atualizada")
  }).catch((err) => {
    //console.log("Err 02 " + err)
  })

}

/**
 * Funcao que dada um array de id-documentos e uma colection, retorna a lista de documents
 * @param listaIdsDocumentos - array de strings, contendo os id's dos documentos
 * @param collection - nome da collection onde sera feito a busca
 */
function getListaDocuments(listaIdsDocumentos: any, collection: any) {
  return new Promise((resolve, reject: any) => {
    let listaResultado: any = [];
    listaIdsDocumentos.forEach(async (idDoc: any, index: any, array: any) => {
      await DatabaseReferences.db.collection(collection).doc(idDoc).get().then((document) => {
        listaResultado.push(document);
      }).catch((err) => {
        //console.log("getListaDocuments. Erro. Col.: " + collection + " Id: " + idDoc);
        reject("");
      })
      if ((index) + 1 >= array.length) {
        resolve(listaResultado);
      }
    });
  });
}

/**
 * Funcao que dado numero minino e maximo retorna valor aleatorios entre os dois
 * @param min 
 * @param max 
 */
function getNumeroAleatorio(min: any, max: any) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
