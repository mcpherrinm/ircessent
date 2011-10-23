var irc = require('irc')
  , ent = require('ent')
  , fs  = require('fs')
  , _   = require('underscore')
  , irc = require('./ircclient')
  , web = require('./web.js')
  , sck = require('./socket')

var config;

console.log ("hi");

sck.listen(web.app);

fs.readFile(__dirname + "/config.json", 'ascii',
  function(err, data) {
    if(err) {
      console.log("Bailing out, " + err);
      return 1;
    }
    config = JSON.parse(data);
    _(config.sessions).forEach(function(session) {
      irc.setup(session);
      web.setup(session);
      sck.setup(session);
    });
});

