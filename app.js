var irc = require('irc')
 , ent = require('ent')
 , web = require('./web.js')

var sessions = {};

sessions['mimcpher'] = {'nick': 'ircessentdev' }

var irc = require('./ircclient.js').setup(sessions);

require('./socket').setup(sessions, irc, web.app);

web.app.listen(9000);
