import DatabaseReferences from "../../database-references";
import { Timestamp } from "@google-cloud/firestore";


export function construirListaDeEncontros(turmaId: any) {
    return new Promise((resolve, reject) => {
        let planilha: any = [];
        planilha.push({ aluno_foto: '', aluno_mat: '', aluno_nome: '' });
        console.log("construirListaDeEncontros. com promise: ");

        DatabaseReferences.db.collection('Usuario').where('turma', 'array-contains', turmaId).orderBy("nome", "asc").get().then((queryListaDeAlunos) => {
            //console.log("construirListaDeEncontros. queryListaDeAlunos.size: " + queryListaDeAlunos.size);
            let listaDeAlunos = queryListaDeAlunos.docs;


            DatabaseReferences.db.collection('Encontro').where('turma.id', '==', turmaId).orderBy("inicio", "asc").get().then((queryListaDeEncontros) => {
                //console.log("construirListaDeEncontros. queryListaDeEncontros.size: " + queryListaDeEncontros.size);
                let listaDeEncontros = queryListaDeEncontros.docs;


                mapEncontroNomeData(listaDeEncontros).then((myData: any) => {
                    planilha.push(myData[0]);
                    planilha.push(myData[1]);
                    mapAlunoEncontro(listaDeAlunos, listaDeEncontros).then((myData: any) => {
                        myData.forEach((data: any, index: any, array: any) => {
                            planilha.push(data);
                            if ((index + 1) >= array.length) {
                                resolve(planilha);
                            }
                        });
                    }).catch((err) => {
                        console.log('Desculpe. mapAlunoEncontro não concluida ' + err);
                        reject('Desculpe. mapAlunoEncontro não concluida ' + err)
                    });
                }).catch((err) => {
                    console.log('Desculpe. mapEncontroNomeData não concluida ' + err);
                    reject('Desculpe. mapEncontroNomeData não concluida ' + err)
                });

            }).catch((err) => {
                console.log("construirListaDeEncontros. Erro. Collection Turma ou documento não encontrado para turmaId: " + turmaId + '. ' + err);
                reject('Desculpe. Collection Turma ou documento não encontrado para construirListaDeEncontros turmaId: ' + turmaId + '. ' + err)
            });
        }).catch((err) => {
            console.log("Desculpe. Nao encontrei lista de usuarios para esta turmaId: " + turmaId + '. ' + err);
            reject("Desculpe. Nao encontrei lista de usuarios para esta turmaId: " + turmaId + '. ' + err)//return do catch
        });
    });

}


function mapEncontroNomeData(listaDeEncontros: any) {
    let myData: any = [];
    const encontroNome: { [index: string]: any } = {}
    const encontroData: { [index: string]: any } = {}
    return new Promise((resolve, reject) => {
        listaDeEncontros.forEach((encontroDoc: any, index: any, array: any) => {
            let encontro: any = encontroDoc.data();
            let encontroId = encontroDoc.id;
            // console.log("construirListaDeEncontros. mapEncontroNomeData encontroId: " + encontroDoc.id);

            encontroNome[encontroId] = '=HYPERLINK("' + encontro.url + '";"' + encontro.nome + '")';
            encontroData[encontroId] = encontro.inicio != null ? (encontro.inicio as Timestamp).toDate().toLocaleString() : '';

            if ((index + 1) >= array.length) {
                myData.push(encontroNome);
                myData.push(encontroData);
                resolve(myData);
            }
        });
    })

}


function mapAlunoEncontro(listaDeAlunos: any, listaDeEncontros: any) {
    let myData: any = [];
    return new Promise((resolve, reject) => {
        listaDeAlunos.forEach((alunoDoc: any, index: any, array: any) => {
            // let aluno: any = alunoDoc.data();
            // let alunoId: any = alunoDoc.id;
            // console.log("construirListaDeEncontros. mapAlunoEncontro alunoId: " + alunoDoc.id);
            mapMarcarAlunoNoEncontro(alunoDoc, listaDeEncontros).then((alunoMarcado) => {
                myData.push(alunoMarcado);
            })
            if ((index + 1) >= array.length) {
                resolve(myData);//return do then

            }
        });
    })

}

function mapMarcarAlunoNoEncontro(alunoDoc: any, listaDeEncontros: any, ) {
    // let myData = [];
    const alunoMarcadoMap: { [index: string]: any } = {}
    let aluno: any = alunoDoc.data();
    let alunoId: any = alunoDoc.id;

    return new Promise((resolve, reject) => {
        listaDeEncontros.forEach((encontroDoc: any, index: any, array: any) => {
            let encontro: any = encontroDoc.data();
            let encontroId: any = encontroDoc.id;
            alunoMarcadoMap['aluno_foto'] = '=IMAGE("' + aluno.foto.url + '")';
            alunoMarcadoMap['aluno_mat'] = aluno.matricula;
            alunoMarcadoMap['aluno_nome'] = aluno.nome;
            if (encontro.aluno.includes(alunoId)) {
                alunoMarcadoMap[encontroId] = "P";
            } else {
                alunoMarcadoMap[encontroId] = "a";
            }
            if ((index + 1) >= array.length) {
                resolve(alunoMarcadoMap);//return do then
            }
        });
    })

}