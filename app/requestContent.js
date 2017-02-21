var request = require("request");
var cheerio = require("cheerio");

var getContextInfos = function ( context ) {
        
    var contextInfos = [];
    try {

        context.children().each( function( index, elem ) {
            var infos = getFieldsetInfos(elem);
            contextInfos.push(infos);
        } );

    } catch ( error ) {
        if(typeof context.children === 'function'){

            context[0].children.forEach( function( elem, index ) {
                var infos = getFieldsetInfos(elem);
                contextInfos.push(infos);
            } );

        } else {

            context.children.forEach( function( elem, index ) {
                var infos = getFieldsetInfos(elem);
                contextInfos.push(infos);
            } );

        }
        
    }
    

    return contextInfos;
};

// Faz a leitura de um fieldset completo, obtendo informações das tabelas
var getFieldsetInfos = function ( fieldset ) {
    var infos = [];
        
    if(fieldset.children[1] && fieldset.children[1].name == 'fieldset')
        fieldset = fieldset.children[1];

    var tables = fieldset.children.slice(1, fieldset.children.length);
    tables.forEach( function( table, index ) {
        
        var tableInfos = [];
        
        table.children.forEach( function( tr, index) {
            
            tr.children.forEach( function( elem, index ) {
                
                if(elem.children[1]){
                    var info = elem.children[1].children[0];
                    
                    if( info )
                        tableInfos.push(info.data);
                    else
                        tableInfos.push("NULL");
                }
            });
        } );

        if(tableInfos.length > 0)
            infos.push(tableInfos);

    } );
    
    if(infos.length > 1)
        return infos;
    else 
        return infos[0];    

};

var getNFeEventos = function ( table ) {
    var eventos = [];
    var eventos_tr = table.children;
    
    eventos_tr = eventos_tr.slice(1, eventos_tr.length);
    eventos_tr.forEach( function( tr, index ) {
        /*
          Posições e suas infos  
          0 - Evento; 1 - Protocolo; 2 - Data autorização; 
          3 - Data Inclusão BD; 
          4 - Outro array com os dados especificos do evento   
        */
        var evento_info = [];
        var hasInfos = false;

        tr.children.forEach( function( td, index ) {
                        
            if( td.children[0].children[0] ) {
                if(td.children[0].children[0].data)
                    evento_info.push(td.children[0].children[0].data.trim());
                else {
                    var link = td.children[0].children[0];
                    evento_info.push(link.children[0].data.trim());
                    hasInfos = true;
                }
            } else {
                evento_info.push("NULL");
            }
                            
        } );

        if(hasInfos) {

            /*
            Posições das infos
            0 - Ciencia da operacao; 1- Detalhes do evento; 2 - Autorizacao pela SEFAZ;


            Infos para cada posição

            Ciencia da operacao (0):
            Array 0: 0 - Orgao recepcao do Evento; 1 - Ambiente; 2 - Versao
            Array 1: 0 - Autor Evento (CNPJ / CPF); 1 Chave de acesso; 2 - Data evento
            Array 2: 0 - Tipo de evento; 1 - Sequencial do Evento

            Detalhes do evento (1):
            0 - Descricao do evento; 1 - Versao; 2 - Justificativa

            Autorizacao pela SEFAZ (2):
            0 - Mensagem de Autorizacao; 1 - Protocolo; 2 - Data/Hora Autorizacao

            */

            var divInfos = tr.children[1].children[0].children[1].children[0];
            // var infos = getContextInfos( divInfos );
            // evento_info.push(infos);
        }
           
        eventos.push(evento_info);        
    } );

    return eventos;        
};

var getGeralInfosAdd = function ( fieldset ) {
    return fieldset.children[2].children[0].children[0].children[1].children[0].data;
}

var getDescricaoInfosAdd = function ( fieldset ) {
    return fieldset.children[3].children[1].children[0].children[0].children[1].children[0].children[0].data;
}

var getCobrDuplicatas = function ( table ) {
    var dups = [];
    var dups_tr = table.children;
        
    dups_tr = dups_tr.slice(1, dups_tr.length);
    dups_tr.forEach( function( tr, index ) {
        /*
          Posições e suas infos  
          0 - Numero; 1 - Vencimento; 2 - Valor; 
                    
        */
        var dups_info = [];
        
        tr.children.forEach( function( td, index ) {
            
            dups_info.push(td.children[0].children[0].data.trim());
                                       
        } );   

        dups.push(dups_info);
    } );

    return dups;
};

var getProdutos = function ( tabProdutos ) {
     
     /*
     Infos cabecario
     0 - Numero; 1 - Descricao; 2 - Quantidade;
     3 - Unidade comercial; 4 - Valor
     */

    var readTrs = function ( trs ) {
        var infos = [];
        
        trs.forEach( function( td, index ) {
            infos.push(td.children[0].children[0].data);
        } );

        return infos;
    }
    
    var getInfosHeader = function ( table ) {
        var infosHeader = readTrs( table.children[0].children );
        return infosHeader;
    };

    var getInfosProd = function ( table ) {
        var infosProd = [];
    };
    
    var prods = [];
    var divTables = tabProdutos.children().get(0).children[1];

    //Retira table com infos de cabecario
    var divTables = divTables.children.slice(1, divTables.children.length);

    for(var i = 0, size = divTables.length; i < size; i+=2) {
        var infosHeader = getInfosHeader( divTables[i] );
        var infosProd = getInfosProd( divTables[i+1] );

        prods.push( [ infosHeader, infosProd ] );
    }

    return prods;
 
    
};

var collect = function ( accessKey) {

    request( {
        uri: "http://nfe.sefaz.ce.gov.br/pages/consultaNfeXSLTParametro.jsf?efnConsult=35170223944152000148550010000005211308007076"
    }, function( error, response, body ) {

        var $ = cheerio.load(body); 
        
        /*
        ----------------------------------------------------------
                                NFE
        ----------------------------------------------------------
        */
        
        // Infos para tab NFe
        /*
        Para cada contexto
        0 - geral; 1 - Emitente; 2 - Destinatario; 3 - Emissão;
        4 - Situacao atual

        Para geral (0):
        0 - Modelo; 1 - Serie; 2 - Numero; 3 - Data de Emissao; 
        4 - Data/Hora de Saida ou Entrada; 5 - Valor total da nota fiscal

        Para Emitente (1):
        0 - CNPJ; 1 - Nome/Razao Social; 2 - Inscrição Estadual; 3 - UF;

        Para Destinatario (2)
        0 - CNPJ; 1 - Nome/Razao Social; 2 - Inscrição Estadual; 3 - UF;
        4 - Destino da operacao; 5 - Consumidor final; 6 - Presenca do comprador

        Para Emissão (3):
        0 - Processo; 1 - Versão do Processo; 2 - Tipo de Emissao;
        3 - Finalidade; 4 - Natureza da Operacao; 5 - Tipo da operacao
        6 - Forma de Pagamento; 7 - Digest Value da NF-e

        Para Situação atual (4):
        0 - Situacao atual
        1 - Array de eventos (Olhar comentários da estrutura de infos dos eventos)

        */
        var tabNFe = $(".GeralXslt#NFe");
        var tabNFe_infos = getContextInfos(tabNFe);
        
        // Coletando situação atual na tab NFe
        var tabNFe_situ_atual = tabNFe.children().get(4);
             
        var tabNFe_infos_situ_atual = [];
       
        // Obtém texto completo da situação atual
        var situ_atual_temp = tabNFe_situ_atual.children[0].children[0].data;
        // Obtém apenas a palavra que representa a situação atual
        var situ_atual = situ_atual_temp.split(":")[1].split("(")[0].trim();
        
        // Adiciona info da situação atual
        tabNFe_infos_situ_atual.push(situ_atual);

        // Pega o html table que contém todos os eventos
        var tabNFe_eventos = tabNFe_situ_atual.children[1];
        tabNFe_infos_situ_atual.push(getNFeEventos(tabNFe_eventos));        
        
        // Adiciona infos da Situacao atual
        tabNFe_infos[4] = tabNFe_infos_situ_atual;

        // console.log(tabNFe_infos);

        /*
        ----------------------------------------------------------
                                Emitente
        ----------------------------------------------------------
        */

        // Infos para tab Emitente
        /*
        Há apenas a posição 0 - geral

        Para posição geral (0):
        0 - Nome / Razao Social; 1 - Nome Fantasia; 2 - CNPJ; 3 - Endereço;
        4 - Bairro / Distrito; 5 - CEP; 6 - Municipio; 7 - Telefone;
        8 - UF; 9 - Pais; 10 - Inscrição Estadual; 11 - Inscrição estadual do Substituto Tributario
        12 - Inscrição Municipal; 13 - Municipio da Ocorrencia do Fato Gerador do ICMS;
        14 - CNAE Fiscal; 15 - Codigo do Regime Tributario
        */
        var tabEmit = $(".GeralXslt#Emitente");
        // var tabEmit_infos = getContextInfos(tabEmit);
        // console.log(tabEmit_infos);

        /*
        ----------------------------------------------------------
                            Destinatario
        ----------------------------------------------------------
        */

        // Infos para tab Destinatario
        /*
        Há apenas a posição 0 - geral

        Para posição geral (0):
        0 - Nome / Razao Social; 1 - CNPJ; 2 - Endereco; 3 - Bairro / Distrito
        4 - CEP; 5 - Municipio; 6 - Telefone; 7 - UF; 8 - País;
        9 - Indicador IE; 10 - Inscrição Estadual; 11 - Inscrição SUFRAMA;
        12 - IM; 13 - Email

        */
        var tabDest = $(".GeralXslt#DestRem");
        // var tabDest_infos = getContextInfos(tabDest);
        // console.log(tabDest_infos);

        /*
        ----------------------------------------------------------
                            Prod. e Servicos
        ----------------------------------------------------------
        */

        // TODO
        // Infos sobre os produtos
        // Infos para tab Produtos e Serviços
        var tabProdServicos = $(".GeralXslt#Prod");
        console.log(getProdutos( tabProdServicos ));

        /*
        ----------------------------------------------------------
                                Totais
        ----------------------------------------------------------
        */

        // Infos para tab Totais
        /*
        Há apenas a posição 0 - geral

        Para posição geral (0):
        0 - Base de calculo ICMS; 1 - Valor do ICMS; 2 - Valor do ICMS Desonerado
        3 - Base de Calculo ICMS ST; 4 - Valor do ICMS Substituicao;
        5 - Valor total dos produtos; 6 - Valor do Frete; 7 - Valor do seguro;
        8 - Outras despesas acessórias; 9 - Valor total do IPI; 10 - Valor total da NFe;
        11 - Valor total dos descontos; 12 - Valor total do II; 13 - Valor dos PIS
        14 - Valor do COFINS; 15 - Valor aproximado dos Tributos; 16 - Valor total ICMS FCP
        17 - Valor total ICMS Interestadual UF Destino;
        18 - Valor total ICMS Interestadual UF Rem.
        */
        var tabTotais = $(".GeralXslt#Totais");
        // var tabTotais_infos = getContextInfos(tabTotais);
        // console.log(tabTotais_infos);
        
        /*
        ----------------------------------------------------------
                            Transporte
        ----------------------------------------------------------
        */

        // Infos para tab Transporte
        /*
        Para cada contexto
        0 - geral; 1 - Transportador; 2 - Volumes;

        Para posição geral (0):
        0 - Modalidade do Frete;

        Para posição Transportador (1):
        0 - CNPJ; 1 - Razão Social / Nome; 2 - Inscrição estadual;
        3 - Endereço Completo; 4 - Municipio; 5 - UF

        Para posição volumes (2):
        0 - Quantidade; 1 - Especie; 2 - Marca dos Volumes;
        3 - Numeração; 4 - Peso Liquido; 5 - Peso Bruto
        */
        var tabTrans = $(".GeralXslt#Transporte");
        // var tabTrans_infos = getContextInfos(tabTrans);
        // console.log(tabTrans_infos);

        /*
        ----------------------------------------------------------
                                Cobrança
        ----------------------------------------------------------
        */
        // Infos para tab Cobranca
        /*
        Para cada contexto
        0 - Fatura; 1 - Duplicatas; 

        Para posição Fatura (0):
        0 - Numero; 1 - Valor Original; 
        2 - Valor do desconto; 3 - Valor Liquido

        Para posição Duplicatas (1):
        0 - Numero; 1 - Vencimento; 2 - Valor; 
        
        */
        var tabCobr = $(".GeralXslt#Cobranca");
        // var tabCobr_infos = getContextInfos(tabCobr);
                        
        var tabCobr_duplicatas = tabCobr.children().get(0).children[3];
        // var tabCobr_duplicatas_info = getCobrDuplicatas( tabCobr_duplicatas.children[1] );
        
        // tabCobr_infos[1] = tabCobr_duplicatas_info;
        // console.log(tabCobr_infos);

        /*
        ----------------------------------------------------------
                        Informacoes adicionais
        ----------------------------------------------------------
        */

        // Infos para tab Informacoes adicionais
        /*
        Para cada contexto
        0 - geral; 1 - Informacoes complementares de interesse do contribuinte; 

        Para a posição geral (0):
        0 - Formato de impressao DANFE

        Para a posição de Info. complem. (1):
        0 - Descricao
        */
        //TODO
        var tabInfosAdd = $(".GeralXslt#Inf");
        var tabInfosAdd_infos = [];

        var tabInfosAdd_fieldset = tabInfosAdd.children().get(0);
        var tabInfosAdd_geral = [];
        var tabInfosAdd_infos_complem = [];

        tabInfosAdd_geral.push( getGeralInfosAdd( tabInfosAdd_fieldset ) );
        tabInfosAdd_infos_complem.push( getDescricaoInfosAdd( tabInfosAdd_fieldset ) );
        
        tabInfosAdd_infos.push( tabInfosAdd_geral, tabInfosAdd_infos_complem );

        // console.log(tabInfosAdd_infos);

    } );
};

module.exports = collect;