var config = {};

config.port = process.env.PORT || 4201;
config.path = '/';
config.secret = process.env.SECRET || '';
config.repository = '';
config.deploy_script = 'deploy.sh';
config.stop_script = 'stop.sh';
config.servers = {
  '1' : {
    id: 1,
    prNo: 0,
    port1: 6000,
    port2: 8000
  },
  '2' : {
    id: 2,
    prNo: 0,
    port1: 6001,
    port2: 8001
  }
}

module.exports = config;
