var readline = require('readline');
var fs = require('fs');

module.exports = function ( file ) {
    return readline.createInterface({
        input: fs.createReadStream(file || 'chaves')
    });    
};