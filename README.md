# FetchFiscal
Coletor de informações de uma nota fiscal parseando o html da [SEFAZ-CE](http://nfe.sefaz.ce.gov.br/pages/index.jsf).

## Instrução
Você deve inserir as chaves das notas que deseja coletar no arquivo "chaves". O app fará a leitura chave-por-chave e coletará
as informações. 

## Estrutura dos dados
Os dados são coletados todos em estrutura de array. Logo, as devidas posições e estrutura do array estão documentadas no código.
O parser tenta coletar uma estrutura de html não fixa, logo se há infos que aparecem ou deixam de aparecer para determinadas
notas fiscais, o parser tentará coletar adequadamente. No entanto, a documentação das posiçes dos dados não está completa, pois
talvez não informe tais dados. Cabe então ao usuário da app analisar o array completo e identificar os dados. Tal tarefa é simples
devido a prévia estrutura já formada.

## Saida
Não há saida definida pela app, construindo apenas o array com os dados. Logo, cabe ao usuário da app adicionar alguma camada
de persistência e salvar os dados adequadamente onde deseja.
