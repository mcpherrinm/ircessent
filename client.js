var atbottom = function(scrollbox) {
  var height = $(scrollbox).height();
  var scrollHeight = scrollbox.scrollHeight;
  var scrollTop = scrollbox.scrollTop;
  var offset = scrollHeight - height;
  // allow a tolerence for scrolled to bottom
  return (scrollbox.scrollTop > offset - 15); //tolerence is magic number
}

var handleinput = function(line) {
 console.log(line);
 var chat = document.getElementById('chat');
 scrolldown(chat); // always scroll on input, even blank?
 if(line != "") {
  if(line[0] == "/") {
   console.log("command:" + line);
   // handle locally, if not send to server
   socket.emit('command', line);
  } else {
   // otherwise it's a message
   socket.emit("message", line);
  }
 }
}

var scrolldown = function(scrollbox) {
  $(scrollbox).scrollTop(scrollbox.scrollHeight - $(scrollbox).height());
}

var newmessage = function(message) {
  var chat = document.getElementById('chat');
  var bottom = atbottom(chat);
  $('#chat').append("<p>" + message + "</p>");
  if(bottom) {
    scrolldown(chat);
  }
}

/* Run before dom ready: */

var socket = io.connect('http://localhost:9000');
socket.on('statuschange', function(data) {
 console.log("New status" + data);
 socket.emit('statusack', {my: 'GOTCHA' + data});
});

socket.on('message', newmessage);
socket.on('nickchange', function(nick) { $('#nick').text(nick); });
socket.on('topicchange', function(topic) { console.log("Topic: " + topic ); $('#topic').text(topic); });
socket.on('error', function(thing) { newmessage('you cocksucker, you made an error: ' + thing); });

/* Once dom is loaded: */
$(document).ready(function() {

 $('input').keydown(function(event) {
   if(event.keyCode == "13") {
     event.preventDefault();
     handleinput( $(this).val() );
     /* TODO: Grey out, let async handler re-enable when event processed */
     $(this).val("");
   }
 });

 socket.emit('ready', 'dom');
 console.log('ready, bro');
});
