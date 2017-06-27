var http = require('http');
var createHandler = require('github-webhook-handler');

var config = require('./config');
var serverApi = require('./server');

var handler = createHandler({ path: config.path, secret: config.secret });
var server = http.createServer(function (req, res) {
  if(req.url === '/' && req.method === 'GET') {
    res.end(JSON.stringify(serverApi.serverStatus()));
  }
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
});

server.listen(config.port);

handler.on('error', function (err) {
  console.error('Error:', err.message);
});

handler.on('push', function (event) {
  console.log('Received a push event for %s to %s',
    event.payload.repository.name,
    event.payload.ref);
});

handler.on('issues', function (event) {
  console.log('Received an issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title);
});

handler.on('pull_request', function (event) {

  var prNo = parseInt(event.payload.pull_request.number);

  console.log('Received a pull request #%d ', prNo);

  if (event.payload.action === "labeled" && event.payload.label.name === "test") {
    if(serverApi.startServer(prNo))
      console.log('Successfully deployed pull request #%d ', prNo);
  } else if (event.payload.action === "unlabeled" && event.payload.label.name === "test") {
    if(serverApi.stopServer(prNo))
      console.log('Successfully stopped pull_request #%d ', prNo);
  }
});
