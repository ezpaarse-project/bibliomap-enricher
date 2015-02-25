var defaultConfig = {
  debug: false,
  ezpaarse: {
    url: 'http://127.0.0.1:59599', // adjust if ezpaarse is installed elsewhere
    headers: {
      'Accept': 'application/jsonstream',
      // pas de dédoublonnage counter 
      // ni de buffering des lignes de logs
      // pour permettre la diffusion temps réel des ECs
      'Double-Click-Removal': 'false',
      'ezPAARSE-Buffer-Size': 0
    }
  },
  listen: {
    // listen for harvested logs
    harvester: {
      host: '127.0.0.1',  // adjust where log-io.harvester is located
      port: 28770         // this is the default log.io-harvester destination port
    }
  },
  broadcast: {
  // broadcast to logio server daemon
  // broadcast ezpaarse EC's through a network socket
    bibliolog: {
      host: '127.0.0.1',  // adjust where bibliolog (log.io-server) is located
      port: 28778         // port choosen by bibliolog where to broadcast harvested logs + ezpaarse usage events
    },
    bibliomap: {
      host: '127.0.0.1', // socket host
      port: 28779        // socket port
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
