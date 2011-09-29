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
   res.end(data);
  });
}

// Format a message for user display
function line(sock, date, source, unsafeMessage) {
  sock.emit('message', ent.encode( date.toLocaleTimeString() + " <" + source + "> " + unsafeMessage));
}

io.sockets.on('connection', function(socket) {
 sessions['mimcpher']['socket'] = socket;
 socket.emit('statuschange', { status: 'START' });
 socket.on('statusack', function(data) {
  console.log('Status ackd, client synced and ready to go.');
  socket.emit('nickchange', sessions['mimcpher']['nick']);
 });
 socket.on('message', function(unsafeData) {
   line(socket, new Date(), sessions['mimcpher']['nick'], unsafeData);
 });
 socket.on('command', function(unsafeData) {
   unsafesplit = unsafeData.match(/^\/(\w+)(.*)/);
   command = unsafesplit[1]; //safety: \w+ from regex
   // 0 is whole thing, 1 is command, 2 is remainder
   switch(command) {
     case "nick":
       sessions['mimcpher']['nick'] = unsafesplit[2].match(/\w+/)[0];
       socket.emit('nickchange', sessions['mimcpher']['nick']);
       break;
     case "topic":
       socket.emit('topicchange', unsafesplit[2]);
       break;
     default:
       socket.emit('error', {'invalidCommand': command});
   }
 });
});
