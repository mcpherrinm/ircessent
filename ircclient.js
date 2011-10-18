var irc = require('irc')
  , ent = require('ent');

function line(sock, date, source, message) {
  sock.emit('message', ent.encode( date.toLocaleTimeString() + " <" + source + "> " + message));
}


exports['setup'] = function(sessions) {
 user = 'mimcpher';
 function ircconnect(host, nick) {
  var client = new irc.Client(host, nick);
  console.log("connecting....");
  client.addListener('message', function(from, to, message) {
   line(sessions[user]['socket'], new Date(), from, message);
  });
  client.addListener('topic', function (channel, topic, nick) { sessions[user]['socket'].emit('topicchange', topic); });
  client.addListener('raw', function(message) {
   //console.log(message);
  });
  return client;
 }
 sessions[user]['irc'] = ircconnect('irc.freenode.net', sessions[user]['nick']);
 return {
  message: function(data) {
   line(sessions[user]['socket'], new Date(), sessions[user]['nick'], data);
   var channel = "#ircessent";
   sessions[user]['irc'].say(channel, data);
  },
  command: function(data) {
   split = data.match(/^\/(\w+)(.*)/);
   command = split[1]; //safety: \w+ from regex
   // 0 is whole thing, 1 is command, 2 is remainder
   switch(command) {
     case "nick":
       sessions[user]['nick'] = split[2].match(/\w+/)[0];
       sessions[user]['socket'].emit('nickchange', sessions[user]['nick']);
       break;
     case "topic":
       var topic = split[2];
       if(topic != "") {
         sessions[user]['irc'].send('#ircessent', 'TOPIC', 'foo');
         sessions[user]['socket'].emit('topicchange', topic);
       }
       break;
     case "join":
       var channel = "#ircessent";
       sessions[user]['irc'].join(channel);
       console.log('Joining ' + channel);
       line(sessions[user]['socket'], new Date(), channel, "Joining...");
       break;
     default:
       sessions[user]['emit'].emit('error', {'invalidCommand': command});
   }
  }
 }
}
