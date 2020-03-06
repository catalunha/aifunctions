import DatabaseReferences from "../../database-references";


export function construirListaProblemasDaPasta(pastaId: any) {
    return new Promise((resolve, reject) => {
        let planilha: any = [];
        DatabaseReferences.db.collection('Pasta').doc(pastaId).get().then((document: any) => {
            if (!document.exists) {
                //console.log('Desculpe. Collection Usuario ou documento não encontrado para construirListaProblemasDaPasta pastaId' + pastaId);
                reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaProblemasDaPasta pastaId' + pastaId);
            }
            let pasta = document.data();
            //console.log("construirListaProblemasDaPasta. pastaId: " + document.id);

            planilha.push({ a: 'pastaId', b: document.id });
            planilha.push({ a: 'nome', b: pasta.nome });
            planilha.push({ a: 'descricao', b: pasta.descricao });

            DatabaseReferences.db.collection('Problema').where('pasta.id', '==', pastaId).orderBy("numero", "asc").get().then((queryListaDeProblemas) => {
                //console.log("construirListaProblemasDaPasta. queryListaDeProblemas.size: " + queryListaDeProblemas.size);
                let listaDeProblemas = queryListaDeProblemas.docs;
                planilha.push({
                    c: 'nome',
                    d: 'fonte',
                    e: 'url',
                    f: 'solucao',
                    g: 'simulacoes',

                });
                listaDeProblemas.forEach((item: any, index: any, array: any) => {
                    //console.log("construirListaProblemasDaPasta. problemaId: " + item.id);
                    let problema = item.data();
                    planilha.push({
                        c: problema.nome,
                        d: problema.descricao,
                        e: '=HYPERLINK("' + problema.url + '";"Link para o arquivo")',
                        f: '=HYPERLINK("' + problema.solucao + '";"Link para o arquivo")',
                        g: problema.simulacaoNumero,
                    });

                    if ((index + 1) >= array.length) {
                        resolve(planilha);//return do then
                    }
                });

            }).catch((err) => {
                reject("Desculpe. Nao encontrei lista de Tarefas para este pastaId" + pastaId + '. ' + err)//return do catch
                //console.log("Desculpe. Nao encontrei lista de Tarefas para este pastaId" + pastaId + '. ' + err);

            });

        }).catch((err) => {
            reject('Desculpe. Collection Usuario ou documento não encontrado para construirListaProblemasDaPasta pastaId' + pastaId + '. ' + err)
            //console.log("construirListaProblemasDaPasta. Erro. Collection Usuario ou documento não encontrado para pastaId: " + pastaId + '. ' + err);
        });

    });

}
