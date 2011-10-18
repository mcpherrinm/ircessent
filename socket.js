var CAS = require('cas')
 , Cookies = require('cookies')

var cas = new CAS({base_url: 'https://cas.uwaterloo.ca/cas', service: pageurl});

exports.setup = function(sessions, ircapp, webapp) {
  var io = require('socket.io').listen(webapp);

  io.configure(function () {
    io.set('authorization', function(handshakedata, callback) {
      // No error, and true to allow client
      console.log(handshakedata);
      var cookies = new Cookies(handshakedata, null);
      var ticket = cookies.get('ticket');
      cas.validate(ticket, function(err, status, username) {
        handshakedata.user = 'mimcpher';
        if(status) {
          callback('tix didnt validate', false);
        } else {
          callback(null, true);
        }
      });
    });
  });

  io.sockets.on('connection', function(socket) {
    // Setup new socket.
    console.log('connecting ' + JSON.stringify(socket.handshake));
    var user = socket.handshake.user;
    console.log('sock connect from ' + user);
    sessions[user]['socket'] = socket;
    socket.on('message', ircapp.message);
    socket.on('command', ircapp.command);
  });
}
