var request = require("request");
var cheerio = require("cheerio");

var getTabInfos = function ( tab ) {
 
    var tabInfos = [];

    tab.children().each( function( index, elem ) {
        var infos = getContextInfos(elem);
        tabInfos.push(infos);
    } );

    return tabInfos;
};

var getContextInfos = function ( context ) {
    var infos = [];

    var fieldset = context;
    
    if(fieldset.children[1].name == 'fieldset')
        fieldset = fieldset.children[1];

    fieldset.children[1].children.forEach( function( tr, index) {
            
        tr.children.forEach( function( elem, index ) {
            
            if(elem.children[1]){
                var info = elem.children[1].children[0];
                
                if( info )
                    infos.push(info.data);
                else
                    infos.push("NULL");
            }
        });
    } );

    return infos;

};

var collect = function ( accessKey) {

    request( {
        uri: "http://nfe.sefaz.ce.gov.br/pages/consultaNfeXSLTParametro.jsf?efnConsult=35170223944152000148550010000005211308007076"
    }, function( error, response, body ) {

        var $ = cheerio.load(body); 
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

        */
        var tabNFe = $(".GeralXslt#NFe");
        var tabNFe_infos = getTabInfos(tabNFe);
        // TODO
        // Coletar situação atual conforme os popups
        // console.log(tabNFe_infos);
                
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
        var tabEmit_infos = getTabInfos(tabEmit);
                
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
        var tabDest_infos = getTabInfos(tabDest);
        // console.log(tabDest_infos);

        // TODO
        // Infos sobre os produtos
        // Infos para tab Produtos e Serviços
        var tabProdServicos = $(".GeralXslt#Prod");
        var tabProdServicos_infos = tabProdServicos.children();

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
        var tabTotais_infos = getTabInfos(tabTotais);
        // console.log(tabTotais_infos);
        
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
        var tabTrans_infos = getTabInfos(tabTrans);
        // console.log(tabTrans_infos);

        // Infos para tab Cobranca
        /*
        Para cada contexto
        0 - Fatura; 1 - Duplicatas; 

        Para posição Fatura (0):
        0 - Numero; 1 - Valor Original; 
        2 - Valor do desconto; 3 - Valor Liquido

        Para posição Duplicatas (1):
        //TODO
        
        */
        var tabCobr = $(".GeralXslt#Cobranca");
        // var tabCobr_infos = getTabInfos(tabCobr);
        // console.log(tabCobr_infos);
        
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
        // var tabInfosAdd_infos = getTabInfos(tabInfosAdd);
        // console.log(tabInfosAdd_infos);

    } );
};

module.exports = collect;