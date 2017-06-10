var http = require('http');
var createHandler = require('github-webhook-handler');
var config = require('./config');
var handler = createHandler({ path: config.path, secret: config.secret });
const exec = require('child_process').exec;

var server = http.createServer(function (req, res) {
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
  console.log('Received a pull request #%d ',
    event.payload.pull_request.number);
  if (event.payload.action === "labeled" && event.payload.label.name === "test") {
    var pr = event.payload.pull_request.number;
    var repo = config.repository;
    var start_command = './deploy.sh '+ repo + ' ' + pr;
    var startChild = exec(start_command, // command line argument directly in string
      function (error, stdout, stderr) {      // one easy function to capture data/errors
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });
  } else if (event.payload.action === "unlabeled" && event.payload.label.name === "test") {
    var stop_command = './stop.sh';
    var stopChild = exec(stop_command, // command line argument directly in string
      function (error, stdout, stderr) {      // one easy function to capture data/errors
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
    });
  } 
});
