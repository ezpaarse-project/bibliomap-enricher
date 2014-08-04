// example
// +log biblioinserm bibliolog info 16.2.255.24 - 13BBIU1158 [01/Aug/2013:16:56:36 +0100] "GET http://onlinelibrary.wiley.com:80/doi/10.1111/dme.12357/pdf HTTP/1.1" 200 13639

var LogIoServerParser = require('log.io-server-parser');
var request = require('request');
var es      = require('event-stream'); 

var ezpaarseJobs = {};

// écoute les logs venant du harvester
var server = new LogIoServerParser({ port: 28777 });
server.listen();

server.on('+node', function (node, streams) {
  // création des différents job ezpaarse
  // un par stream
  streams.forEach(function (streamName) {
    ezpaarseJobs[streamName] = {
      request: request.post({
        url: 'http://127.0.0.1:40010',
        headers: {
         'Accept': 'application/jsonstream',
         'Double-Click-Removal': 'false', // pas de dédoublonnage counter pour le temps réel
         'ezPAARSE-Buffer-Size': 0        // pas de buffering des lignes de logs pour le temps réel
        }
      }),
      writeStream: es.through()
    };
    ezpaarseJobs[streamName].writeStream.pipe(ezpaarseJobs[streamName].request);
    ezpaarseJobs[streamName].request.pipe(process.stdout);
  });
  console.log('ezpaarse jobs', streams);
});

server.on('-node', function (node) {
  // Object.keys(ezpaarseJobs).forEach(function (streamName) {
  //   ezpaarseJobs[streamName].end();
  // });
  console.log('-node', node);
});

server.on('+log', function (streamName, node, type, log) {
  ezpaarseJobs[streamName].writeStream.write(log + '\n');
  //console.log('+log', streamName, node, type, log);
  process.stdout.write('.');
});

server.on('unknown', function (data) {
  console.log('unknown', data);
});

