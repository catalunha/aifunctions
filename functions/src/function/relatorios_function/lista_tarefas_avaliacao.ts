import DatabaseReferences from "../../database-references";
import { Timestamp } from "@google-cloud/firestore";


export function construirListaDeTarefasDaAvaliacao(avaliacaoId: any) {
    return new Promise((resolve, reject) => {
        let planilha: any = [];
        DatabaseReferences.db.collection('Avaliacao').doc(avaliacaoId).get().then((document: any) => {
            if (!document.exists) {
                //console.log('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeTarefasDaAvaliacao avaliacaoId' + avaliacaoId);
                reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeTarefasDaAvaliacao avaliacaoId' + avaliacaoId);
            }
            let avaliacao = document.data();
            //console.log("construirListaDeTarefasDaAvaliacao. avaliacaoId: " + document.id);

            planilha.push({ a: 'turmaId', b: avaliacao.turma.id });
            planilha.push({ a: 'turma_nome', b: avaliacao.turma.nome });
            planilha.push({ a: 'avaliacaoId', b: document.id });
            planilha.push({ a: 'nome', b: avaliacao.nome });
            planilha.push({ a: 'descricao', b: avaliacao.descricao });
            planilha.push({ a: 'inicio', b: avaliacao.inicio != null ? (avaliacao.inicio as Timestamp).toDate().toLocaleString() : '' });
            planilha.push({ a: 'fim', b: avaliacao.fim != null ? (avaliacao.fim as Timestamp).toDate().toLocaleString() : '' });

            DatabaseReferences.db.collection('Tarefa').where('avaliacao.id', '==', avaliacaoId).orderBy("inicio", "asc").get().then((queryListaDeTarefas) => {
                //console.log("construirListaDeTarefasDaAvaliacao. queryListaDeTarefas.size: " + queryListaDeTarefas.size);
                let listaDeTarefas = queryListaDeTarefas.docs;
                planilha.push({
                    c: 'avaliacao',
                    d: 'questao',
                    e: 'problema_nome',
                    f: 'problema_arquivo',
                    g: 'simulacao',
                    h: 'aluno_nome',
                    i: 'aluno_foto',
                    j: 'avaliacao_nota',
                    k: 'questao_nota',
                    l: 'nota',
                });
                listaDeTarefas.forEach((item: any, index: any, array: any) => {
                    //console.log("construirListaDeTarefasDaAvaliacao. tarefa: " + item.id);
                    let tarefa = item.data();
                    let nota = '=';
                    for (const [key, value] of Object.entries(tarefa.gabarito)) {
                        console.log(key);
                        let item: any = value;
                        nota = nota + '+' + item.nota;
                    }
                    planilha.push({
                        c: tarefa.avaliacao.nome,
                        d: tarefa.questao.numero,
                        e: tarefa.problema.nome,
                        f: '=HYPERLINK("' + tarefa.problema.url + '";"Link para o arquivo")',
                        g: tarefa.simulacao.nome,
                        h: tarefa.aluno.nome,
                        i: '=IMAGE("' + tarefa.aluno.foto + '")',
                        j: tarefa.avaliacaoNota,
                        k: tarefa.questaoNota,
                        l: nota,
                    });

                    if ((index + 1) >= array.length) {
                        resolve(planilha);//return do then
                    }
                });

            }).catch((err) => {
                reject("Desculpe. Nao encontrei lista de Tarefas para este avaliacaoId" + avaliacaoId + '. ' + err)//return do catch
                //console.log("Desculpe. Nao encontrei lista de Tarefas para este avaliacaoId" + avaliacaoId + '. ' + err);

            });

        }).catch((err) => {
            reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeTarefasDaAvaliacao avaliacaoId' + avaliacaoId + '. ' + err)
            //console.log("construirListaDeTarefasDaAvaliacao. Erro. Collection Usuario ou documento não encontrado para avaliacaoId: " + avaliacaoId + '. ' + err);
        });

    });

}
