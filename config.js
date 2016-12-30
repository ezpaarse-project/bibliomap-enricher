var defaultConfig = require('./config.json');

// to allow config overloading 
// by a local config file
var nconf   = require('nconf');
var localConf = {};
try {
  localConf = require('./config.local.js');
} catch (err) { }
 
nconf.argv()
     .env([
        'BBE_EZPAARSE_URL',
        'BBE_EZPAARSE_PREDEF',
        'BBE_LISTEN_HARVESTER_HOST',
        'BBE_LISTEN_HARVESTER_PORT',
        'BBE_BROADCAST_VIEWER_HOST',
        'BBE_BROADCAST_VIEWER_PORT'
      ])
     .overrides(localConf)
     .defaults(defaultConfig);

var config = nconf.get();

if (config.BBE_EZPAARSE_URL)          { config.ezpaarse.url = config.BBE_EZPAARSE_URL; }
if (config.BBE_EZPAARSE_PREDEF)       { config.ezpaarse.headers['ezPAARSE-Predefined-Settings'] = config.BBE_EZPAARSE_PREDEF; }
if (config.BBE_LISTEN_HARVESTER_HOST) { config.listen['bibliomap-harvester'].host = config.BBE_LISTEN_HARVESTER_HOST; }
if (config.BBE_LISTEN_HARVESTER_PORT) { config.listen['bibliomap-harvester'].port = config.BBE_LISTEN_HARVESTER_PORT; }
if (config.BBE_BROADCAST_VIEWER_HOST) { config.broadcast['bibliomap-viewer'].host = config.BBE_BROADCAST_VIEWER_HOST; }
if (config.BBE_BROADCAST_VIEWER_PORT) { config.broadcast['bibliomap-viewer'].port = config.BBE_BROADCAST_VIEWER_PORT; }

module.exports = config;