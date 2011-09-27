var app = require('http').createServer(handler)
 , io = require('socket.io').listen(app)
 , fs = require('fs')

app.listen(9000);

function handler(req, res) {
 fs.readFile(__dirname + "/chat.html",
  function(err, data) {
   if(err) {
    res.writeHead(500);
    return res.end('Error');
   }
   res.writeHead(200);
   res.end(data);
  });
}

io.sockets.on('connection', function(socket) {
 socket.emit('statuschange', { status: 'START' });
 socket.on('statusack', function(data) {
  console.log(data);
  socket.emit('message', 'yo ho-ho');
 });
 socket.on('message', function(data) {
   console.log("user messaged " + data);
   socket.emit('message', (new Date()).toLocaleTimeString() +" <you> " + data);
 });
});
