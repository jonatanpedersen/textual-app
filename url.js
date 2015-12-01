var url = require('url');

var expected = 'https://github.com/jonatanpedersen/translator-app-texts.git';
var temp = url.parse(expected);
temp.auth = 'MY TOKEN';

var actual = url.format(temp);
//console.log(temp, expected, actual, expected == actual);


console.log(actual);
