var Cookies = require('cookies');

exports.app = require('socket.io');
exports.setup = function(sessions) {
  io = exports.app;

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
    sessions[user].socket = socket;
    socket.on('message', sessions[user].irc.message);
    socket.on('command', sessions[user].irc.command);
  });
};
