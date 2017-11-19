var https = require('https');
var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

https.get('https://raw.githubusercontent.com/eleme/hackathon_tank/master/src/main/resources/player.idl', res => {
  res.pipe(fs.createWriteStream('./player.idl'));
  res.on('data', data => {
    exec(path.join(__dirname, 'thrift.exe') + ' --gen js:node ./player.idl', (err, stdout, stderr) => {
      console.log(err);
    });
  });
}).on('error', e => {
  console.error(e);
});
