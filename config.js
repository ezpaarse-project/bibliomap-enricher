var defaultConfig = {
  ezpaarse: 'http://127.0.0.1:59599',
  logio: {
    listen: { // listen for harvested logs
      host: '127.0.0.1',
      port: 28777
    },
    broadcast: { // broadcast to logio server daemon
      host: '127.0.0.1',
      port: 28778
    }
  },
  autoConnectDelay: 1000,
};

// to allow config overloading 
// by a local config file
var nconf   = require('nconf');
var localConf = {};
try {
  localConf = require('./config.local.js');
} catch (err) { }
 
nconf.argv()
     .env()
     .overrides(localConf)
     .defaults(defaultConfig);

module.exports = nconf.get();
