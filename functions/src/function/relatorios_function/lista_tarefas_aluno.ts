import DatabaseReferences from "../../database-references";
import { Timestamp } from "@google-cloud/firestore";


export function construirListaDeTarefasDoAluno(usuarioId: any) {
    return new Promise((resolve, reject) => {
        let planilha: any = [];
        DatabaseReferences.db.collection('Usuario').doc(usuarioId).get().then((document: any) => {
            if (!document.exists) {
                //console.log('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeTarefasDoAluno usuarioId' + usuarioId);
                reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeTarefasDoAluno usuarioId' + usuarioId);
            }
            let doc = document.data();
            //console.log("construirListaDeTarefasDoAluno. usuarioId: " + document.id);

            planilha.push({ a: 'alunoId', b: usuarioId });
            planilha.push({ a: 'nome', b: doc.nome });
            planilha.push({ a: 'matricula', b: doc.matricula });
            planilha.push({ a: 'email', b: doc.email });
            planilha.push({ a: 'cracha', b: doc.cracha });
            planilha.push({ a: 'celular', b: doc.celular });
            planilha.push({ a: 'foto', b: '=IMAGE("' + doc.foto.url + '")' });

            DatabaseReferences.db.collection('Tarefa').where('aluno.id', '==', usuarioId).orderBy("inicio", "asc").get().then((queryListaDeTarefas) => {
                //console.log("construirListaDeTarefasDoAluno. queryListaDeTarefas.size: " + queryListaDeTarefas.size);
                let listaDeTarefas = queryListaDeTarefas.docs;
                planilha.push({ c: 'avaliacao', d: 'questao', e: 'item', f: 'valor', });
                listaDeTarefas.forEach((item: any, index: any, array: any) => {
                    let tarefa = item.data();
                    //console.log("construirListaDeTarefasDoAluno. tarefa: " + item.id);
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'id', f: item.id });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'aberta', f: tarefa.aberta });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'avaliacao', f: tarefa.avaliacao.nome });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'questao', f: tarefa.questao.numero });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'problema_nome', f: tarefa.problema.nome });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'problema_arquivo', f: '=HYPERLINK("' + tarefa.problema.url + '";"Link para o arquivo")' });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'tempo', f: tarefa.tempo });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'tentativa', f: tarefa.tentativa });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'tentou', f: tarefa.tentou });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'inicio', f: tarefa.inicio != null ? (tarefa.inicio as Timestamp).toDate().toLocaleString() : '' });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'iniciou', f: tarefa.iniciou != null ? (tarefa.iniciou as Timestamp).toDate().toLocaleString() : '' });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'enviou', f: tarefa.enviou != null ? (tarefa.enviou as Timestamp).toDate().toLocaleString() : '' });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'fim', f: tarefa.fim != null ? (tarefa.fim as Timestamp).toDate().toLocaleString() : '' });
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'modificado', f: tarefa.modificado != null ? (tarefa.modificado as Timestamp).toDate().toLocaleString() : '' });

                    for (const [key, value] of Object.entries(tarefa.variavel)) {
                        console.log(key);
                        let item: any = value;
                        planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'variavel_nome', f: item.nome });
                        planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'variavel_valor', f: item.valor });
                    }
                    let nota = '=';
                    for (const [key, value] of Object.entries(tarefa.gabarito)) {
                        console.log(key);
                        let item: any = value;
                        nota = nota + '+' + item.nota;

                        planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'gabarito_nome', f: item.nome });
                        if (item.tipo == 'numero' || item.tipo == 'palavra' || item.tipo == 'texto') {
                            planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'gabarito_resposta', f: item.resposta });
                        } else if (item.tipo == 'url' || item.tipo == 'arquivo') {
                            planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'gabarito_resposta', f: '=HYPERLINK("' + item.resposta + '","Link para o arquivo")' });
                        } else if (item.tipo == 'urlimagem' || item.tipo == 'imagem') {
                            planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'gabarito_resposta', f: '=IMAGE("' + item.resposta + '")' });
                        }
                        planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'gabarito_nota', f: item.nota });
                    }
                    planilha.push({ c: tarefa.avaliacao.nome, d: tarefa.questao.numero, e: 'notaTotal', f: nota });

                    if ((index + 1) >= array.length) {
                        resolve(planilha);//return do then
                    }
                });

            }).catch((err) => {
                reject("Desculpe. Nao encontrei lista de Tarefas para este usuarioId" + usuarioId + '. ' + err)//return do catch
                //console.log("Desculpe. Nao encontrei lista de Tarefas para este usuarioId" + usuarioId + '. ' + err);

            });

        }).catch((err) => {
            reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeTarefasDoAluno usuarioId' + usuarioId+ '. ' + err)
            //console.log("construirListaDeTarefasDoAluno. Erro. Collection Usuario ou documento não encontrado para usuarioId: " + usuarioId+ '. ' + err);
        });

    });

}
