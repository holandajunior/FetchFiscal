var collect = require('./request_content');
var stream = require('./read_file');

var reader = stream();

reader.on('line', function( line ) {
    collect(line);
    
});

