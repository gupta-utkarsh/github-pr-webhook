const express = require('express')
var createHandler = require('github-webhook-handler');

var config = require('./config');
var serverApi = require('./server');

var handler = createHandler({ path: config.path, secret: config.secret });
const app = express();

app.get('/', function (req, res) {
  res.json(serverApi.serverStatus());
});

app.post(config.path, function (req,res) {
  handler(req, res, function (err) {
    res.statusCode = 404;
    res.end('no such location');
  });
  res.statusCode = 200;
  res.end('OK');
});

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

app.listen(config.port, function () {
  console.log('application listening on port %d', config.port);
})
