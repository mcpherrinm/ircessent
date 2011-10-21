var irc = require('irc')
 , ent = require('ent')
 , web = require('./web.js')
 , fs = require('fs')

var config;

console.log ("hi");

fs.readFile(__dirname + "/config.json", 'ascii',
 function(err, data) {
  if(err) {
   console.log("Bailing out, " + err);
   return 1;
  }
  console.log(data);
  config = JSON.parse(data);
  var irc = require('./ircclient.js').setup(config.sessions);

  require('./socket').setup(config.sessions, irc, web.app);

  web.app.listen(9000);
});

