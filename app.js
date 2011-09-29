var app = require('http').createServer(handler)
 , io = require('socket.io').listen(app)
 , fs = require('fs')
 , ent = require('ent')
 , irc = require('irc')

app.listen(9000);

sessions = {
  'mimcpher': {
    'nick': 'mimcpher',
    'socket': null,
    'irc': [],
  },
  };

function handler(req, res) {
 fs.readFile(__dirname + "/chat.html",
  function(err, data) {
   if(err) {
    res.writeHead(500);
    return res.end('Error');
   }
   res.writeHead(200); 
   /* Todo: Render data into initial page for non-JS / static / backlog use */
   /* Put listener onto IRC to start getting bits popped into the socket */
   res.end(data);
  });
}

// Format a message for user display
function line(sock, date, source, message) {
  sock.emit('message', ent.encode( date.toLocaleTimeString() + " <" + source + "> " + message));
}

io.sockets.on('connection', function(socket) {
 var user = 'mimcpher'; // todo: Verify :P
 sessions[user]['socket'] = socket;
 socket.emit('statuschange', { status: 'START' });
 socket.on('statusack', function(data) {
  console.log('Status ackd, client synced and ready to go.');
  socket.emit('nickchange', sessions[user]['nick']);
 });
 socket.on('message', function(data) {
   line(socket, new Date(), sessions[user]['nick'], data);
   var channel = "#herptest";
   sessions[user]['irc'].say(channel, data);
 });
 socket.on('command', function(data) {
   split = data.match(/^\/(\w+)(.*)/);
   command = split[1]; //safety: \w+ from regex
   // 0 is whole thing, 1 is command, 2 is remainder
   switch(command) {
     case "nick":
       sessions[user]['nick'] = split[2].match(/\w+/)[0];
       socket.emit('nickchange', sessions[user]['nick']);
       break;
     case "topic":
       var topic = split[2];
       if(topic != "") {
         socket.emit('topicchange', topic);
       }
       break;
     case "connect":
       var host = 'irc.freenode.net';
       var client = new irc.Client(host, sessions[user]['nick']);
       sessions[user]['irc'] = client;
       console.log("connecting....");
       client.addListener('message', function(from, to, message) {
         line(sessions[user]['socket'], new Date(), from, message);
       });
       client.addListener('topic', function (channel, topic, nick) { socket.emit('topicchange', topic); });
       break;
     case "join":
       var channel = "#herptest";
       sessions[user]['irc'].join(channel);
       console.log('Joining ' + channel);
       line(socket, new Date(), channel, "Joining...");
       break;
     default:
       socket.emit('error', {'invalidCommand': command});
   }
 });
});
