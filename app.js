var app = require('http').createServer(handler)
 , io = require('socket.io').listen(app)
 , fs = require('fs')
 , ent = require('ent')
 , irc = require('irc')
 , CAS = require('cas')

pageurl = 'http://corn-syrup.csclub.uwaterloo.ca:9000/'

cas = new CAS({base_url: 'https://cas.uwaterloo.ca/cas', service: pageurl});
app.listen(9000);

sessions = {
  'mimcpher': {
    'nick': 'mimcpher',
    'socket': null,
    'irc': null,
  },
  };

function servechat(req, res) {
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

function handler(req, res) {
  console.log(req.url);
  console.log(req.headers);
  var logged_in = false; // todo, cookie?
  if(!logged_in) {
    var parsed = require('url').parse(req.url, true);
    console.log(parsed);
    var ticket = parsed['query']['ticket'];
    if(ticket) {
      cas.validate(ticket, function(err, status, username) {
        if(err) {
          res.writeHead(403); res.end("fuckoff"); 
        } else {
          servechat(req, res);
        }
      });
    } else {
      // No ticket and logged out:
      res.writeHead(302, {'Location': "https://cas.uwaterloo.ca/cas/login?service=" + pageurl});
      res.end("Redirecting");
    }
  } else {
    servechat(req, res);
  }
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
  console.log("got ack");
 });
 socket.on('ready', function(data) {
  console.log('client ready');
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
