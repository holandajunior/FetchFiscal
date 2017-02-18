var request = require("request");
var cheerio = require("cheerio");


request( {
    uri: "http://nfe.sefaz.ce.gov.br/pages/consultaNfeXSLTParametro.jsf?efnConsult=35170223944152000148550010000005211308007076"
}, function( error, response, body ) {
    
    var $ = cheerio.load(body);
    
    // Infos para tab NFe
    /*
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
    var tabNFe_infos = [];

    var tabNFe = $(".GeralXslt#NFe");
    tabNFe.children().each( function( index, elem ) {
        var infos = [];
        getValues(elem, infos);
        tabNFe_infos.push(infos);
    } );

    console.log(tabNFe_infos);
    
    

    // Informações gerais para NFe
    // var tabNFe_general = tabNFe_infos.get(0);    
    /*
    Infos armazenadas em suas posicoes
    
    */
    // var NFe_general_infos = [];
    // getValues(tabNFe_general, NFe_general_infos);
    // console.log(NFe_general_infos);                 
    
    // Informações de Emitente para NFe
    // var tabNFe_emitente = tabNFe_infos.get(1);
    /*
    Infos
    
    */               
    // var NFe_emit_infos = [];
    // getValues(tabNFe_emitente, NFe_emit_infos);
    // console.log(NFe_emit_infos);

    // Informações destinatário para NFe
    // var tabNFe_dest = tabNFe_infos.get(2);
    /*
    Infos
   
    */
    // var NFe_dest_infos = [];
    // getValues(tabNFe_dest, NFe_dest_infos);
    // console.log()

    // var tabNFe_emissao = tabNFe_infos.get(3);
    // var tabNFe_situacao = tabNFe_infos.get(4);
    
    // Infos para tab Emitente
    var tabEmit = $(".GeralXslt#Emitente");
    var tabEmit_infos = tabEmit.children();
    
    
    // Infos para tab Destinatario
    var tabDest = $(".GeralXslt#DestRem");
    var tabDest_infos = tabDest.children();

    // Infos para tab Produtos e Serviços
    var tabProdServicos = $(".GeralXslt#Prod");
    var tabProdServicos_infos = tabProdServicos.children();

    // Infos para tab Totais
    var tabTotais = $(".GeralXslt#Prod");
    var tabTotais_infos = tabTotais.children();

    // Infos para tab Transporte
    var tabTrans = $(".GeralXslt#Transporte");
    var tabTrans_infos = tabTrans.children();

    // Infos para tab Cobranca
    var tabCobr = $(".GeralXslt#Cobranca");
    var tabCobr_infos = tabCobr.children();
    
    // Infos para tab Informacoes adicionais
    var tabInfosAdd = $(".GeralXslt#Inf");
    var tabInfosAdd_infos = tabInfosAdd.children();
} );

var getValues = function(context, store) {

    context.children[1].children.forEach( function( elem, index) {
        var tr = elem;
        
        tr.children.forEach( function( elem, index ) {
               
            if(elem.children[1]){
                var info = elem.children[1].children[0];
                store.push(info.data);
            }
                

        });

    } );
}