var fs = require('fs')
 , CAS = require('cas')
 , Cookies = require('cookies')

exports.app = require('http').createServer(handler)

pageurl = 'http://localhost:9000/'

cas = new CAS({base_url: 'https://cas.uwaterloo.ca/cas', service: pageurl});

function servestatic(file, res) {
  fs.readFile(__dirname + file,
      function(err, data) {
        if(err) {
          res.writeHead(404);
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
  var parsed = require('url').parse(req.url, true);
  var file = parsed['pathname'];
  if(file != "/") { // allow other resources without auth
    return servestatic(file, res);
  }
  var ticket = parsed['query']['ticket'];
  if(ticket) {
    cas.validate(ticket, function(err, status, username) {
      console.log("setting cookie for " + username);
      if(!status) {
        res.writeHead(403); res.end("fuckoff"); 
      } else {
        var cookies = new Cookies(req, res);
        cookies.set('user', username);
        servestatic('/interface.html', res);
      }
    });
  } else {
    // No ticket and logged out:
    res.writeHead(302, {'Location': "https://cas.uwaterloo.ca/cas/login?service=" + pageurl});
    res.end("Redirecting");
  }
}
