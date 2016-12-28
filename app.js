// log.io protocol example
// +log biblioinserm bibliomap info 16.2.255.24 - 13BBIU1158 [01/Aug/2013:16:56:36 +0100] "GET http://onlinelibrary.wiley.com:80/doi/10.1111/dme.12357/pdf HTTP/1.1" 200 13639

var config = require('./config.js');

var LogIoServerParser = require('log.io-server-parser');
var request           = require('request').defaults({'proxy': null});
var es                = require('event-stream'); 
var JSONStream        = require('JSONStream');
var net               = require('net');

var ezpaarseJobs = {};
var bibliomap    = null;
var server       = null;

// Par défaut nodejs limite le nombre de connexion à 5 
// ce qui signifie que si on ne change pas cette limite
// on ne pourrait pas faire plus de 5 traitements ezpaarse
// simultanément.
// On passe la limite à 20 car nous avons 8 bibliosites.
require('http').globalAgent.maxSockets = 20;

/**
 * Listen events coming from ezpaarse2log.io-harvester
 * then forward it to ezpaarse jobs
 */
server = new LogIoServerParser(config.listen.harvester);
server.listen(function() {console.error(new Date() + ' - Connection from ezpaarse2log.io-harvester (log.io-harvester protocol)');});
console.error(new Date() + ' - Ready to receive ezpaarse2log.io-harvester data at ' + JSON.stringify(config.listen.harvester));

server.on('+node', function (node, streams) {
  var proxyStreams = [];
  // création des différents job ezpaarse
  // un par stream
  streams.forEach(function (streamName) {
    proxyStreams.push(streamName);
    proxyStreams.push(streamName + '-ezpaarse');

    // création d'un slot vide qui acceuillera
    // un job ezpaarse
    ezpaarseJobs[streamName] = null;
  });
});
server.on('+log', function (streamName, node, type, log) {
  if (ezpaarseJobs[streamName]) {
    ezpaarseJobs[streamName].writeStream.write(log + '\n');
  }
});


/**
 * Create the ezpaarse jobs and respawn 
 * crashed or terminated jobs each N seconds
 */
setInterval(function () {
  Object.keys(ezpaarseJobs).forEach(function (streamName) {
    // running job => skipping
    if (ezpaarseJobs[streamName] !== null) return;

    console.error(new Date() + " - Create an ezpaarse job for " + streamName);

    // else, create a new job
    ezpaarseJobs[streamName] = {
      request: request.post({
        url: config.ezpaarse.url,
        headers: config.ezpaarse.headers
      }),
      writeStream: es.through()
    };
    ezpaarseJobs[streamName].writeStream.pipe(ezpaarseJobs[streamName].request);
    ezpaarseJobs[streamName].request
      .pipe(JSONStream.parse())
      .pipe(es.mapSync(function (data) {
        var msg = '';
        msg += '[' + data.datetime + ']';
        msg += ' ' + data.login;
        msg += ' ' + data.platform;
        msg += ' ' + data.platform_name;
        msg += ' ' + data.rtype;
        msg += ' ' + data.mime;
        msg += ' ' + (data.print_identifier || '-');
        msg += ' ' + (data.online_identifier || '-');
        msg += ' ' + (data.doi || '-');
        msg += ' ' + data.url;
        var logioMsg = '+log|' + streamName + '-ezpaarse' + '|bibliolog|info|' + msg;
        if (bibliomap && bibliomap.connected) {
          data.ezproxyName = streamName;
          bibliomap.write(JSON.stringify(data) + '\n');
        }
        if (config.debug) {
          console.log(logioMsg);          
        }
      }));

    // check the ezpaarse connection is not closed
    ezpaarseJobs[streamName].request.on('error', function (err) {
      console.error(new Date() + ' - "error" event on the ezpaarse job ' + streamName + ' [' + err + ']');
      delete ezpaarseJobs[streamName];
      ezpaarseJobs[streamName] = null;
      console.error(new Date() + ' - Cleanup ezpaarse finished job on ' + streamName);
    });
    ezpaarseJobs[streamName].request.on('close', function () {
      console.error(new Date() + ' - "close" event on the ezpaarse job ' + streamName);
      delete ezpaarseJobs[streamName];
      ezpaarseJobs[streamName] = null;
      console.error(new Date() + ' - Cleanup ezpaarse finished job on ' + streamName);
    });
    ezpaarseJobs[streamName].request.on('end', function () {
      console.error(new Date() + ' - "end" event on the ezpaarse job ' + streamName);
      delete ezpaarseJobs[streamName];
      ezpaarseJobs[streamName] = null;
      console.error(new Date() + ' - Cleanup ezpaarse finished job on ' + streamName);
    });

    ezpaarseJobs[streamName].request.on('response', function (response) {
      console.error(new Date() + ' - Job ' + response.headers['job-id'] + ' ok for ' + streamName);
    });


    // // close each hours ezpaarse connections
    // // could help to stabilize bibliolog
    // setTimeout(function () {
    //   console.error(new Date() + ' - Aborting ezpaarse job ' + streamName);
    //   ezpaarseJobs[streamName].request.end();
    // }, 60 * 60 * 1000);

  }); // forEach streams
}, config.autoConnectDelay);


/**
 * Try to (re)connect to bibliomap each N seconds
 */
setInterval(function () {
  // si une connexion avec bibliomap est en cours on ne fait rien
  if (bibliomap !== null) return;

  bibliomap = net.connect(config.broadcast.bibliomap);
  bibliomap.on('connect', function () {
    console.error(new Date() + ' - Connected to bibliomap ' + config.broadcast.bibliomap.host + ':' + config.broadcast.bibliomap.port + ' => ready to broadcast ezpaarse ECs');
    bibliomap.connected = true;
  });
  bibliomap.on('error', function (err) {
    console.error(new Date() + ' - Bibliomap connection got error: ' + err);
  });
  bibliomap.on('close', function () {
    console.error(new Date() + ' - Bibliomap connection closed');
    bibliomap = null;
  });
}, config.autoConnectDelay);
