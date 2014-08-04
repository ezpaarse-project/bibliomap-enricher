// example
// +log biblioinserm bibliolog info 16.2.255.24 - 13BBIU1158 [01/Aug/2013:16:56:36 +0100] "GET http://onlinelibrary.wiley.com:80/doi/10.1111/dme.12357/pdf HTTP/1.1" 200 13639

var LogIoServerParser = require('log.io-server-parser');
var request = require('request');
var es      = require('event-stream'); 
var JSONStream = require('JSONStream');

var net    = require('net');
bibliolog  = net.connect({ port: 28778, host: '127.0.0.1' }, function () {
  console.log('binded to bibliolog 127.0.0.1:28778');

  var ezpaarseJobs = {};

  // écoute les logs venant du harvester
  var server = new LogIoServerParser({ port: 28777 });
  server.listen();

  server.on('+node', function (node, streams) {
    var proxyStreams = [];
    // création des différents job ezpaarse
    // un par stream
    streams.forEach(function (streamName) {
      proxyStreams.push(streamName);
      proxyStreams.push(streamName + '-ecs');

      ezpaarseJobs[streamName] = {
        request: request.post({
          url: 'http://127.0.0.1:40010',
          headers: {
           'Accept': 'application/jsonstream',
            // pas de dédoublonnage counter 
            // ni de buffering des lignes de logs
            // pour permettre la diffusion temps réel des ECs
           'Double-Click-Removal': 'false',
           'ezPAARSE-Buffer-Size': 0
          }
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
          msg += ' ' + data.rtype;
          msg += ' ' + data.mime;
          msg += ' ' + data.print_identifier;
          msg += ' ' + data.online_identifier;
          msg += ' ' + data.doi;
          bibliolog.write('+log|' + streamName + '-ecs' + '|bibliolog|info|' + msg + '\r\n');
          console.log(msg);
        }));
    });
    console.log('ezpaarse jobs', streams);

    // +node|bibliolog|bibliovie,biblioplanets,biblioshs,titanesciences,bibliost2i,bibliosciences,biblioinserm,archivesiop
    
    bibliolog.write('+node|bibliolog|' + proxyStreams.join(',') + '\r\n');
  });

  // server.on('-node', function (node) {
  //   // Object.keys(ezpaarseJobs).forEach(function (streamName) {
  //   //   ezpaarseJobs[streamName].end();
  //   // });
  //   //console.log('-node', node);
  // });

  server.on('+log', function (streamName, node, type, log) {
    ezpaarseJobs[streamName].writeStream.write(log + '\n');
  });

  // server.on('unknown', function (data) {
  //   console.error('unknown', data);
  // });

  server.on('raw', function (data) {
    if (data.indexOf('+node') !== -1) {
      // ignore
    } else {
      // forward the raw log data to bibliolog
      bibliolog.write(data + '\r\n');      
    }
    //console.log(data);
  });

  // server.on('-node', function (node) {
  //   console.log('-node', node);
  // });
  // server.on('+node', function (node, streams) {
  //   console.log('+node', node, streams);
  // });











});
