const fs = require('fs');

var data = fs.readFileSync("shortestbatch.csv", 'utf8');
console.log(data.match(/\r\n/g));