var config = {};

config.port = process.env.PORT || 4201;
config.path = '/';
config.secret = process.env.SECRET || '';
config.repository = '';

module.exports = config;
