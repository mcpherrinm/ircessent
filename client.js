<!doctype html>

<script src="http://code.jquery.com/jquery-latest.js"></script>
<script src="/socket.io/socket.io.js"></script>

<script>

/* Defs */
var resize = function() {
  // Todo: #fill is parent height minus height of siblings
 var calc = $(window).height() - $('#top').height() - $('#bottom').height();
 $('#fill').height(calc);
}

var atbottom = function(fill) {
  var height = $(fill).height();
  var scrollHeight = fill.scrollHeight;
  var scrollTop = fill.scrollTop;
  var offset = scrollHeight - height;
  // allow a tolerence for scrolled to bottom
  return (fill.scrollTop > offset - 15); //tolerence is magic number
}

var handleinput = function(line) {
 console.log(line);
 var fill = document.getElementById('fill');
 scrolldown(fill); // always scroll on input, even blank?
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

var scrolldown = function(fill) {
  $(fill).scrollTop(fill.scrollHeight - $(fill).height());
}

var newmessage = function(message) {
  var fill = document.getElementById('fill');
  var bottom = atbottom(fill);
  $('#chat').append("<p>" + message + "</p>");
  if(bottom) {
    scrolldown(fill);
  }
}

/* Run before dom ready: */

var socket = io.connect('http://corn-syrup.csclub.uwaterloo.ca:9000');
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

 resize();
 $(window).resize(resize);

 $('#cmdline').keydown(function(event) {
   if(event.keyCode == "13") {
     event.preventDefault();
     handleinput( $(this).val() );
     /* TODO: Grey out, let async handler re-enable when event processed */
     $(this).val("");
   }
 socket.emit('ready', 'dom');
});

});
</script>

<style>
  * {
    margin: 0;
  }
  html, body {
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; 
  }

  #top, #bottom {
    background: #eee;
  }

  div#fill {
    overflow-y: scroll;
    width: 100%;
  }

  div#chat {
    padding: 4px;
  }

  #bottom {
    padding: 0;
    border: 0;
    width: 100%;
    display: -moz-box;
    -moz-box-orient: horizontal;
    -moz-box-align: center;
  }

  #input {
    -moz-box-flex: 1;
  }

  #input > input {
    width: 100%;
  }
</style>

<div id=container>
 <div id=top>
  <p id=topic>{{topic}}</p>
 </div>

 <div id=fill>
  <div id=chat>
   {% for ii in backlog %}
   <p>{{ii}}</p>
   {% endfor %}
  </div>
 </div>

<div id=bottom>
  <div id=nickbox>[ <span id=nick>{{nick}}</span> ] </div>
  <div id=input>
    <input type=text id=cmdline>
  </div>
  </div>
</div>