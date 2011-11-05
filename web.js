/* vim:set ts=2 sw=2 sts=2 et */
var fs = require('fs');
var CAS = require('cas');
var Cookies = require('cookies');

var srv = require('http').createServer(handler);

srv.listen(process.env.PORT);

exports.app = srv;

var addr = exports.app.address();

var pageurl = 'http://' + addr.address + ':' + addr.port + '/';

cas = new CAS({base_url: 'https://cas.uwaterloo.ca/cas', service: pageurl});

function servestatic(file, res) {
  fs.readFile(__dirname + file,
    function(err, data) {
      if(err) {
        res.writeHead(404);
        return res.end('Error');
      }
      res.writeHead(200);
      res.end(data);
    });
}

function handler(req, res) {
  console.log(req.url);
  var parsed = require('url').parse(req.url, true);
  var file = parsed.pathname;
  if(file != "/") { // allow other resources without auth
    return servestatic(file, res);
  }
  var ticket = parsed.query.ticket;
  if(ticket) {
    cas.validate(ticket, function(err, status, username) {
      if(!status) {
        res.writeHead(302, {'Location': "https://cas.uwaterloo.ca/cas/login?service=" + pageurl});
        return res.end('Bad Ticket!');
      }
      if(!session[username]) {
        // Redirect to new session setup
        res.writeHead(500);
        return res.end("Not Implemented");
      }
      var cookies = new Cookies(req, res);
      cookies.set('user', username); // todo: Keygrip sign cookie
      console.log("Successful Login: " + username);
      /* Todo: Render data into initial page for non-JS / static / backlog use */
      /* Put listener onto IRC to start getting bits popped into the socket */
      servestatic('/interface.html', res);
    });
  }
  // No ticket and logged out:
  res.writeHead(302, {'Location': "https://cas.uwaterloo.ca/cas/login?service=" + pageurl});
  return res.end("Redirecting");
}
