import DatabaseReferences from "../../database-references";
import { Timestamp } from "@google-cloud/firestore";

// conversor online de pdf para html para ser alterado. este conversor é mais limpo de codigos
// https://www.htmlpublish.com/

export function construirImprimirTarefaPdf(tarefaId: any) {
    return new Promise((resolve, reject) => {
        let html: any = [];

        DatabaseReferences.db.collection('Tarefa').doc(tarefaId).get().then((document: any) => {
            if (!document.exists) {
                //console.log('Desculpe. Collection Usuario ou documento não encontrado para construirListaProblemasDaPasta tarefaId' + tarefaId);
                reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaProblemasDaPasta tarefaId' + document.id);
            }
            let tarefa = document.data();
            html.push('<HTML>');
            html.push('<HEAD>');
            html.push('<TITLE>PI-Brintec</TITLE>');
            html.push('</HEAD>');
            html.push('<BODY BGCOLOR="FFFFFF">');

            html.push('<H1> Tarefa numero: ' + tarefa.questao.numero + '</H1>');
            html.push('<H2> Dados da aplicação:' + '</H2>');
            html.push('<ul>');
            html.push(`<li>id: ${document.id} </li>`);
            html.push('<li>avaliacao: ' + tarefa.avaliacao.nome + '</li>');
            html.push('<li>questao: ' + tarefa.questao.numero + '</li>');
            html.push('<li>problema_nome: ' + tarefa.problema.nome + '</li>');
            html.push('<li>problema_arquivo: ' + '<a href="' + tarefa.problema.url + '">click aqui</a>' + '</li>');
            html.push('<li>tempo: ' + tarefa.tempo + '</li>');
            html.push('<li>tentativa: ' + tarefa.tentativa + '</li>');
            html.push('<li>tentou: ' + tarefa.tentou + '</li>');
            html.push('<li>inicio: ' + (tarefa.inicio != null ? (tarefa.inicio as Timestamp).toDate().toLocaleString() : '') + '</li>');
            html.push('<li>iniciou: ' + (tarefa.iniciou != null ? (tarefa.iniciou as Timestamp).toDate().toLocaleString() : '') + '</li>');
            html.push('<li>enviou: ' + (tarefa.enviou != null ? (tarefa.enviou as Timestamp).toDate().toLocaleString() : '') + '</li>');
            html.push('<li>fim: ' + (tarefa.fim != null ? (tarefa.fim as Timestamp).toDate().toLocaleString() : '') + '</li>');
            html.push('<li>modificado: ' + (tarefa.modificado != null ? (tarefa.modificado as Timestamp).toDate().toLocaleString() : '') + '</li>');
            html.push('</ul>');

            // html.push('');
            html.push('<H2> Problema proposto:' + '</H2>');

            html.push('<p>Considere o problema proposto apresentado neste link, <a href="' + tarefa.problema.url + '">click aqui</a>, e reproduzida no Anexo I, no final deste texto.</p>');

            html.push('<H2> Valores individuais:' + '</H2>');
            html.push('<ul>');
            if (tarefa.variavel != null && Object.entries(tarefa.variavel).length > 0) {
                Object.entries(tarefa.variavel).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                    // let key=array[0];
                    let value = array[1];
                    html.push('<li>variavel_nome: ' + value.nome + '</li>');
                    html.push('<li>variavel_tipo: ' + value.tipo + '</li>');
                    if (value.tipo == 'url') {
                        html.push('<li>variavel_valor: ' + '<a href="' + value.valor + '">click aqui</a>' + '</li>');
                    } else if (value.tipo == 'urlimagem') {
                        html.push('<li>variavel_valor: ' + '<img src="' + modificarUrlImagemGoogleDrive(value.valor) + '" height=320" width="320">' + '</li>');
                        html.push('<li>variavel_valor_link: ' + '<a href="' + value.valor + '">click aqui</a>' + '</li>');
                    } else {
                        html.push('<li>variavel_valor: ' + value.valor + '</li>');
                    }
                })
            }
            html.push('</ul>');

            // html.push('');

            html.push('<H2> Resposta:' + '</H2>');
            html.push('<ul>');
            if (tarefa.gabarito != null && Object.entries(tarefa.gabarito).length > 0) {
                Object.entries(tarefa.gabarito).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                    // let key=array[0];
                    let value = array[1];
                    html.push('<li>gabarito_nome: ' + value.nome + '</li>');
                    html.push('<li>gabarito_tipo: ' + value.tipo + '</li>');
                    if (value.tipo == 'url' || value.tipo == 'arquivo') {
                        html.push('<li>gabarito_resposta: ' + '<a href="' + value.resposta + '">click aqui</a>' + '</li>');
                    } else if (value.tipo == 'urlimagem' || value.tipo == 'imagem') {
                        html.push('<li>gabarito_resposta: ' + '<img src="' + modificarUrlImagemGoogleDrive(value.resposta) + '" height=320" width="320">' + '</li>');
                        html.push('<li>gabarito_resposta_link: ' + '<a href="' + value.resposta + '">click aqui</a>' + '</li>');
                    } else {
                        html.push('<li>gabarito_resposta: ' + value.valor + '</li>');
                    }
                })
            }
            html.push('</ul>');

            html.push('<H2> Gabarito:' + '</H2>');
            html.push('<ul>');

            if (tarefa.gabarito != null && Object.entries(tarefa.gabarito).length > 0) {
                Object.entries(tarefa.gabarito).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                    // let key=array[0];
                    let value = array[1];
                    html.push('<li>gabarito_nome: ' + value.nome + '</li>');
                    html.push('<li>gabarito_tipo: ' + value.tipo + '</li>');
                    if (value.tipo == 'url' || value.tipo == 'arquivo') {
                        html.push('<li>gabarito_valor: ' + '<a href="' + value.valor + '">click aqui</a>' + '</li>');
                    } else if (value.tipo == 'urlimagem' || value.tipo == 'imagem') {
                        html.push('<li>gabarito_valor: ' + '<img src="' + modificarUrlImagemGoogleDrive(value.valor) + '" height=320" width="320">' + '</li>');
                        html.push('<li>gabarito_valor_link: ' + '<a href="' + value.valor + '">click aqui</a>' + '</li>');
                    } else {
                        html.push('<li>gabarito_valor: ' + value.valor + '</li>');
                    }
                })
            }
            html.push('</ul>');

            html.push('<H2> Anexo I:' + '</H2>');
            html.push('<iframe src="' + tarefa.problema.url + '" height="1280" width="100%"></iframe>');

            html.push('</BODY>');
            html.push('</HTML>');

            var config = {
                format: 'A4',
                orientation: "portrait",
                margin: '1cm',
                height: "29cm",
                width: "21cm",
                header: {
                    height: "2cm",
                    contents: '<div style="float:right">Tarefa número: ' + tarefa.questao.numero + '</div>'
                },
                footer: {
                    height: "2cm",
                    contents: {
                        // first: 'Cover page',
                        // 2: 'Second page', // Any page number is working. 1-based index
                        default: '<span style="float:right">{{page}}-{{pages}}</span>', // fallback value
                        // last: 'Last Page'
                    }
                },
            };
            resolve([html.join("\n"), config]);

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