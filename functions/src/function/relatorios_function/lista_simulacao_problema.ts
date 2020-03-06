import DatabaseReferences from "../../database-references";


export function construirListaDeSimulacoesDoProblema(problemaId: any) {
    return new Promise((resolve, reject) => {
        let planilha: any = [];
        DatabaseReferences.db.collection('Problema').doc(problemaId).get().then((document: any) => {
            if (!document.exists) {
                //console.log('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeSimulacoesDoProblema problemaId' + problemaId);
                reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeSimulacoesDoProblema problemaId' + problemaId);
            }
            let problema = document.data();
            //console.log("construirListaDeSimulacoesDoProblema. problemaId: " + document.id);

            planilha.push({ a: 'pastaId', b: problema.pasta.id });
            planilha.push({ a: 'pasta_nome', b: problema.pasta.nome });
            planilha.push({ a: 'nome', b: problema.nome });
            planilha.push({ a: 'fonte', b: problema.descricao });
            planilha.push({ a: 'url', b: '=HYPERLINK("' + problema.url + '";"Link para o arquivo")' });
            planilha.push({ a: 'solucao', b: '=HYPERLINK("' + problema.solucao + '";"Link para o arquivo")' });
            planilha.push({ a: 'simulacoes', b: problema.simulacaoNumero });
            planilha.push({ a: 'simulacao', b: 'item', c: 'valor' });

            DatabaseReferences.db.collection('Simulacao').where('problema.id', '==', problemaId).orderBy("nome", "asc").get().then((queryListaDeSimulacoes) => {
                //console.log("construirListaDeSimulacoesDoProblema. queryListaDeSimulacoes.size: " + queryListaDeSimulacoes.size);
                let listaDeSimulacoes = queryListaDeSimulacoes.docs;

                listaDeSimulacoes.forEach((item: any, index: any, array: any) => {
                    //console.log("construirListaDeSimulacoesDoProblema. simulacaoId: " + item.id);
                    let simulacao = item.data();
                    planilha.push({ a: simulacao.nome, b: 'simulacao_nome', c: simulacao.nome, });
                    planilha.push({ a: simulacao.nome, b: 'simulacao_descricao', c: simulacao.descricao, });

                    if (simulacao.variavel != null && Object.entries(simulacao.variavel).length > 0) {
                        Object.entries(simulacao.variavel).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                            // let key=array[0];
                            let value = array[1];
                            planilha.push({ a: simulacao.nome, b: 'variavel_nome', c: value.nome, });
                            planilha.push({ a: simulacao.nome, b: 'variavel_tipo', c: value.tipo, });
                            if (value.tipo == 'url') {
                                planilha.push({ a: simulacao.nome, b: 'variavel_valor', c: '=HYPERLINK("' + value.valor + '";"Link para o arquivo")', });
                            } else if (value.tipo == 'urlimagem') {
                                planilha.push({ a: simulacao.nome, b: 'variavel_valor', c: '=IMAGE("' + modificarUrlImagemGoogleDrive(value.valor) + '")', });
                                planilha.push({ a: simulacao.nome, b: 'variavel_valor_link', c: '=HYPERLINK("' + value.valor + '";"Link para o arquivo")', });
                            } else {
                                planilha.push({ a: simulacao.nome, b: 'variavel_valor', c: value.valor, });
                            }
                        })
                    }
                    if (simulacao.gabarito != null && Object.entries(simulacao.gabarito).length > 0) {
                        Object.entries(simulacao.gabarito).sort((a: any, b: any) => { return a[1].ordem - b[1].ordem }).forEach((array: any) => {
                            // let key=array[0];
                            let value = array[1];
                            planilha.push({ a: simulacao.nome, b: 'gabarito_nome', c: value.nome, });
                            planilha.push({ a: simulacao.nome, b: 'gabarito_tipo', c: value.tipo, });
                            if (value.tipo == 'url' || value.tipo == 'arquivo') {
                                planilha.push({ a: simulacao.nome, b: 'gabarito_valor', c: '=HYPERLINK("' + value.valor + '";"Link para o arquivo")', });
                            } else if (value.tipo == 'urlimagem' || value.tipo == 'imagem') {
                                planilha.push({ a: simulacao.nome, b: 'gabarito_valor', c: '=IMAGE("' + modificarUrlImagemGoogleDrive(value.valor) + '")', });
                                planilha.push({ a: simulacao.nome, b: 'gabarito_valor_link', c: '=HYPERLINK("' + value.valor + '";"Link para o arquivo")', });
                            } else {
                                planilha.push({ a: simulacao.nome, b: 'gabarito_valor', c: value.valor, });
                            }
                        })
                    }
                    if ((index + 1) >= array.length) {
                        resolve(planilha);//return do then
                    }
                });

            }).catch((err) => {
                reject("Desculpe. Nao encontrei lista de Tarefas para este problemaId" + problemaId + '. ' + err)//return do catch
                //console.log("Desculpe. Nao encontrei lista de Tarefas para este problemaId" + problemaId + '. ' + err);

            });

        }).catch((err) => {
            reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaDeSimulacoesDoProblema problemaId' + problemaId + '. ' + err)
            //console.log("construirListaDeSimulacoesDoProblema. Erro. Collection Usuario ou documento não encontrado para problemaId: " + problemaId + '. ' + err);
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