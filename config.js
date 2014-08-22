var defaultConfig = {
  debug: false,
  ezpaarse: 'http://127.0.0.1:59599', // adjust if ezpaarse is installed elsewhere
  logio: {
    // listen for harvested logs
    listen: {
      host: '127.0.0.1',  // adjust where log-io.harvester is located
      port: 28777         // this is the default log.io-harvester destination port
    },
    // broadcast to logio server daemon
    broadcast: {
      host: '127.0.0.1',  // adjust where bibliolog (log.io-server) is located
      port: 28778         // port choosen by bibliolog where to broadcast harvested logs + ezpaarse usage events
    }
  },
  autoConnectDelay: 1000, // time to wait beetween each connection try
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
