var config = require('./config');
var errorHandler = require('./error_handler');
var execSync = require('child_process').execSync;

function serverApi() {

  var servers = config.servers;

	var getFreeServer = function getFreeServer(prNo) {
		var freeServer = false;
    for (const key of Object.keys(servers)) {
      if(servers[key].prNo === 0) {
        freeServer = servers[key];
        break;
      }
    }
    return freeServer;
  }

	var setServerPr = function setServerPr(id, prNo) {
		var idString = '' + id;
		servers[idString].prNo = parseInt(prNo);
	}

	var getServerByPr = function getServerByPr(prNo) {
		var server = false;
    for (const key of Object.keys(servers)) {
      if(servers[key].prNo === prNo) {
        server = servers[key];
        break;
      }
    }
    return server;
	}

	var removeServerPr = function removeServerPr(id) {
		var idString = '' + id;
		servers[idString].prNo = 0;
	}

  var setServerToDeploying = function setServerToDeploying(id) {
    var idString = '' + id;
    var status = 'DEPLOYING';
    servers[idString].status = status;
  }

  var setServerToDeployed = function setServerToDeployed(id) {
    var idString = '' + id;
    var status = 'DEPLOYED';
    servers[idString].status = status;
  }

  var setServerToInactive = function setServerToInactive(id) {
    var idString = '' + id;
    var status = 'INACTIVE';
    servers[idString].status = status;
  }

	var startServer = function startServer(prNo) {
		var freeServer = getFreeServer(prNo);
		if (freeServer) {
		  var start_command = config.deploy_script_path +
        ' ' +
        config.repository +
        ' ' +
        prNo +
        ' ' +
        freeServer.id +
        ' ' +
        freeServer.port1 +
        ' ' +
        freeServer.port2;

			console.log(start_command);
      setServerToDeploying(freeServer.id);
      var startChild = execSync(start_command, errorHandler);
		  setServerPr(freeServer.id, prNo);
      setServerToDeployed(freeServer.id);
      return true;
    } else {
      return false;
    }
  }

  var stopServer = function stopServer(prNo) {
    var server = getServerByPr(prNo);
    if (server) {
      var stop_command = config.stop_script_path +
      ' ' +
      config.repository +
      ' ' +
      prNo +
      ' ' +
      server.id +
      ' ' +
      server.port1 +
      ' ' +
      server.port2;

      console.log(stop_command);
      var stopChild = execSync(stop_command, errorHandler);
      removeServerPr(server.id);
      setServerToInactive(server.id);
      return true;
    } else {
      return false;
    }
  }

  var serverStatus = function serverStatus() {
    return servers;
  }

  return {
    serverStatus: serverStatus,
    startServer: startServer,
    stopServer: stopServer
  }
}

var serverApi = serverApi();

module.exports = serverApi;
