'use strict';

// const admin = require('firebase-admin');
// admin.initializeApp();
// import DatabaseReferences from "../database-references";
// import { construirListaDeAlunosDaTurma } from "./relatorios_function/lista_alunos_turma";
// import { construirListaDeTarefasDaAvaliacao } from "./relatorios_function/lista_tarefas_avaliacao";
// import { construirListaProblemasDaPasta } from "./relatorios_function/lista_problemas_pasta";
// import { construirListaDeSimulacoesDoProblema } from "./relatorios_function/lista_simulacao_problema";
// import { construirListaDeTarefasDoAluno } from "./relatorios_function/lista_tarefas_aluno";
// import { construirListaDeEncontros } from "./relatorios_function/lista_encontros";
// import { construirImprimirTarefaMd } from "./relatorios_function/imprimir_tarefa_md";
// import { construirImprimirTarefaPdf } from "./relatorios_function/imprimir_tarefa_pdf";

import * as admin from 'firebase-admin';
// const admin = require('firebase-admin');
admin.initializeApp();


const express = require('express');
const cors = require('cors')({ origin: true });
export const app = express();
app.use(cors);
// var pdf = require('html-pdf');
// const json2csv = require("json2csv").parse;

// https://www.npmjs.com/package/json-2-csv-ts
// https://www.npmjs.com/package/json-2-csv
// https://www.npmjs.com/package/json2csv

let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>
  <script type="text/javascript" src="https://dartpad.dev/experimental/inject_embed.dart.js"></script>
  <style>
  code {
    font-family: monospace;
    width: 1300px;
    height: 1300px;
  }
  </style>
</head>
<body>
  ola
  <pre >
    <code  class="language-run-dartpad:theme-dark:mode-dart:run-true:split-40:width-80%:height-800px">
      // gerado pelo firebase
      
      void main() {
        var i = 20;
        print('fibonacci($i) = \${fibonacci(i)}');
      }
      
      /// Computes the nth Fibonacci number.
      int fibonacci(int n) {
        return n < 2 ? n : (fibonacci(n - 1) + fibonacci(n - 2));
      }    </code>
</pre>
oi
<!-- <iframe src="https://dartpad.dev/embed-html.html?id=72d83fe97bfc8e735607&split=80&theme=dark"></iframe> -->

<script type="text/javascript" src="https://dartpad.dev/experimental/inject_embed.dart.js"></script>
</body>

</html>
`;

// /listadeencontros?pedido=<relatorioId>
app.get('/html', (request: any, response: any) => {

            response.setHeader(
                "Content-disposition",
                "attachment; filename=darpad.html"
            );
            response.set("Content-Type", "text/html");

            const bucket = admin.storage().bucket();
            const file = bucket.file('dartpadcata.html');
    
            file.save(html, {
    
                contentType: "text/html",
    
            }).then(() => {
                console.log("FOI -> html")
            }).catch((err: any) => {
    
                console.log("savePdf Error: " + err)
            
            })

            response.status(200).send(html);


    // let pedidoId = request.query.pedido;
    // console.log("ListaDeEncontros :: Pedido id: ", pedidoId);
    // DatabaseReferences.db.collection('Relatorio').doc(pedidoId).get().then((docRelatorio: any) => {
    //     if (!docRelatorio.exists) {
    //         //console.log('Desculpe. Collection Relatorio ou documento não encontrado para ListaDeEncontros.');
    //         throw new Error("Desculpe. Collection Relatorio ou documento não encontrado para ListaDeEncontros.");
    //     }
    //     let relatorio = docRelatorio.data();
    //     // //console.log("ListaDeEncontros. Relatorio id: " + docRelatorio.id);
    //     construirListaDeEncontros(relatorio.turmaId).then((planilha) => {
    //         const csv = json2csv(planilha);
    //         response.setHeader(
    //             "Content-disposition",
    //             "attachment; filename=ListaDeEncontros.csv"
    //         );
    //         response.set("Content-Type", "text/csv");
    //         response.status(200).send(csv);
    //         DatabaseReferences.db.collection('Relatorio').doc(pedidoId).delete().then(() => {
    //             //console.log("ListaDeEncontros. Deletado  pedidoId: " + pedidoId);
    //         })
    //     }).catch((err) => {
    //         response.status(403).send('Desculpe. Não foi possível construir a ListaDeEncontros' + err);
    //     });
    // }).catch((err) => {
    //     response.status(403).send('Desculpe. Não existe pedido autenticado para ListaDeEncontros.' + err);
    // });
});
