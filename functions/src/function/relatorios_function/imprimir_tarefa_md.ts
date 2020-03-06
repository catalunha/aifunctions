import DatabaseReferences from "../../database-references";
import { Timestamp } from "@google-cloud/firestore";


export function construirImprimirTarefaMd(tarefaId: any) {
    return new Promise((resolve, reject) => {
        let markdown: any = [];

        DatabaseReferences.db.collection('Tarefa').doc(tarefaId).get().then((document: any) => {
            if (!document.exists) {
                //console.log('Desculpe. Collection Usuario ou documento não encontrado para construirListaProblemasDaPasta tarefaId' + tarefaId);
                reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaProblemasDaPasta tarefaId' + document.id);
            }
            let tarefa = document.data();
            markdown.push('# Tarefa numero: ' + tarefa.questao.numero);
            markdown.push('## Dados da aplicação:');
            markdown.push('- id: ' + document.id);
            markdown.push('- avaliacao: ' + tarefa.avaliacao.nome);
            markdown.push('- questao: ' + tarefa.questao.numero);
            markdown.push('- problema_nome: ' + tarefa.problema.nome);
            markdown.push('- problema_arquivo: ' + '[Link para o arquivo](' + tarefa.problema.url + ')');
            markdown.push('- tempo: ' + tarefa.tempo);
            markdown.push('- tentativa: ' + tarefa.tentativa);
            markdown.push('- tentou: ' + tarefa.tentou);
            markdown.push('- inicio: ' + (tarefa.inicio != null ? (tarefa.inicio as Timestamp).toDate().toLocaleString() : ''));
            markdown.push('- iniciou: ' + (tarefa.iniciou != null ? (tarefa.iniciou as Timestamp).toDate().toLocaleString() : ''));
            markdown.push('- enviou: ' + (tarefa.enviou != null ? (tarefa.enviou as Timestamp).toDate().toLocaleString() : ''));
            markdown.push('- fim: ' + (tarefa.fim != null ? (tarefa.fim as Timestamp).toDate().toLocaleString() : ''));
            markdown.push('- modificado: ' + (tarefa.modificado != null ? (tarefa.modificado as Timestamp).toDate().toLocaleString() : ''));

            markdown.push('');
            markdown.push('## Problema proposto:');

            markdown.push('Considere o problema proposto apresentado neste link, [clique aqui](' + tarefa.problema.url + '), e reproduzida no Anexo I, no final deste texto.');

            markdown.push('## Valores individuais:');

            if (tarefa.variavel != null && Object.entries(tarefa.variavel).length > 0) {
                Object.entries(tarefa.variavel).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                    // let key=array[0];
                    let value = array[1];
                    markdown.push('- variavel_nome: ' + value.nome);
                    markdown.push('- variavel_tipo: ' + value.tipo);
                    if (value.tipo == 'url') {
                        markdown.push('- variavel_valor: ' + '[Link para o arquivo](' + value.valor + ')');
                    } else if (value.tipo == 'urlimagem') {
                        markdown.push('- variavel_valor: ' + '![Link para o arquivo](' + modificarUrlImagemGoogleDrive(value.valor) + ')');
                        markdown.push('- variavel_valor_link: ' + '[Link para o arquivo](' + value.valor + ')');
                    } else {
                        markdown.push('- variavel_valor: ' + value.valor);
                    }
                })
            }
            markdown.push('');

            markdown.push('## Resposta:');
            if (tarefa.gabarito != null && Object.entries(tarefa.gabarito).length > 0) {
                Object.entries(tarefa.gabarito).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                    // let key=array[0];
                    let value = array[1];
                    markdown.push('- gabarito_nome: ' + value.nome);
                    markdown.push('- gabarito_tipo: ' + value.tipo);
                    if (value.tipo == 'url' || value.tipo == 'arquivo') {
                        markdown.push('- gabarito_resposta: ' + '[Link para o arquivo](' + value.resposta + ')');
                    } else if (value.tipo == 'urlimagem' || value.tipo == 'imagem') {
                        markdown.push('- gabarito_resposta: ' + '![Link para o arquivo](' + modificarUrlImagemGoogleDrive(value.resposta) + ')');
                        markdown.push('- gabarito_resposta_link: ' + '[Link para o arquivo](' + value.resposta + ')');
                    } else {
                        markdown.push('- gabarito_resposta: ' + value.valor);
                    }
                })
            }
            markdown.push('');

            markdown.push('## Gabarito:');
            if (tarefa.gabarito != null && Object.entries(tarefa.gabarito).length > 0) {
                Object.entries(tarefa.gabarito).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                    // let key=array[0];
                    let value = array[1];
                    markdown.push('- gabarito_nome: ' + value.nome);
                    markdown.push('- gabarito_tipo: ' + value.tipo);
                    if (value.tipo == 'url' || value.tipo == 'arquivo') {
                        markdown.push('- gabarito_valor: ' + '[Link para o arquivo](' + value.valor + ')');
                    } else if (value.tipo == 'urlimagem' || value.tipo == 'imagem') {
                        markdown.push('- gabarito_valor: ' + '![Link para o arquivo](' + modificarUrlImagemGoogleDrive(value.valor) + ')');
                        markdown.push('- gabarito_valor_link: ' + '[Link para o arquivo](' + value.valor + ')');
                    } else {
                        markdown.push('- gabarito_valor: ' + value.valor);
                    }
                })
            }
            markdown.push('');

            markdown.push('## Anexo I:');
            markdown.push('<iframe src="' + tarefa.problema.url + '" height="1280" width="100%"></iframe>');

            resolve(markdown.join("\n"));

        });

    });

}

function modificarUrlImagemGoogleDrive(url: string) {
    let urlModificada = url;
    if (url.includes('drive.google.com/open')) {
        urlModificada = url.replace('open', 'uc');
    }
    if (url.includes('drive.google.com/file/d/')) {
        if (url.includes('usp=drivesdk')) {
            urlModificada = url
                .replace('/view?usp=drivesdk', '')
                .replace('file/d/', 'open?id=')
                .replace('open', 'uc');
        }
        if (url.includes('usp=sharing')) {
            urlModificada = url
                .replace('/view?usp=sharing', '')
                .replace('file/d/', 'open?id=')
                .replace('open', 'uc');
        }
    }
    return urlModificada;
}