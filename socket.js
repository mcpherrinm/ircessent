var Cookies = require('cookies')


exports.setup = function(sessions, ircapp, webapp) {
  var io = require('socket.io').listen(webapp);

  io.configure(function () {
    io.set('authorization', function(handshakedata, callback) {
      // No error, and true to allow client
      console.log(handshakedata);
      var cookies = new Cookies(handshakedata, null);
      var username = cookies.get('user');
      if(username) { // test cookie signature
        handshakedata.user = username;
        callback(null, true);
      } else {
        callback('no user', false);
      }
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
