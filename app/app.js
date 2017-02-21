var collector = require('./request_content');
var stream = require('./read_file');

var reader = stream();

reader.on('line', function( line ) {
    console.log(line);
});

