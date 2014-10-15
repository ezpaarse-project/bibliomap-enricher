// example
// +log biblioinserm bibliolog info 16.2.255.24 - 13BBIU1158 [01/Aug/2013:16:56:36 +0100] "GET http://onlinelibrary.wiley.com:80/doi/10.1111/dme.12357/pdf HTTP/1.1" 200 13639

var config = require('./config.js');

var LogIoServerParser = require('log.io-server-parser');
var request           = require('request').defaults({'proxy': null});
var es                = require('event-stream'); 
var JSONStream        = require('JSONStream');
var net               = require('net');

var ezpaarseJobs = {};
var bibliolog    = null;
var bibliomap    = null;
var server       = null;

// Par défaut nodejs limite le nombre de connexion à 5 
// ce qui signifie que si on ne change pas cette limite
// on ne pourrait pas faire plus de 5 traitements ezpaarse
// simultanément.
// On passe la limite à 20 car nous avons 8 bibliosites.
require('http').globalAgent.maxSockets = 20;

/**
 * essai de connexion à bibliomap
 * toutes les N secondes
 */
setInterval(function () {
  // si une connexion avec bibliomap est en cours on ne fait rien
  if (bibliomap !== null) return;

  bibliomap = net.connect(config.bibliomap.port, config.bibliomap.host);
  bibliomap.on('connect', function () {
    console.error(new Date() + ' - Connecté à bibliomap sur ' + config.bibliomap.host + ':' + config.bibliomap.port + ' => prêt à broadcaster');
    bibliomap.connected = true;
  });
  bibliomap.on('error', function (err) {
    console.error(new Date() + ' - Connexion bibliomap en erreur : ' + err);
  });
  bibliomap.on('close', function () {
    console.error(new Date() + ' - Connexion bibliomap fermée');
    bibliomap = null;
  });
}, config.autoConnectDelay);

/**
 * essai de connexion à bibliolog
 * toutes les N secondes
 */
 setInterval(function () {
   // si une connexion avec bibliolog est en cours on ne fait rien
   if (bibliolog !== null) return;

   bibliolog = net.connect(config.logio.broadcast);
   bibliolog.on('connect', function () {
     console.error(new Date() + ' - Connecté à bibliolog sur ' + config.logio.broadcast.host + ':' + config.logio.broadcast.port + ' => prêt à broadcaster');
     bibliolog.connected = true;
   });
   bibliolog.on('error', function (err) {
     console.error(new Date() + ' - Connexion bibliolog en erreur : ' + err);
   });
   bibliolog.on('close', function () {
     console.error(new Date() + ' - Connexion bibliolog fermée');
     bibliolog = null;
   });
 }, config.autoConnectDelay);


/**
 * écoute le harvester uniquement si
 * on a une connexion avec bibliolog
 * essai toutes les N secondes
 */
setInterval(function () {
  // si pas de connexion avec bibliolog 
  // ou qu'on écoute déja
  if (bibliolog === null || !bibliolog.connected || server) return;

  // écoute les logs venant du harvester
  server = new LogIoServerParser(config.logio.listen);
  server.listen();

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

    // broadcast to bibliolog
    bibliolog.write('+node|bibliolog|' + proxyStreams.join(',') + '\r\n');
  });

  server.on('+log', function (streamName, node, type, log) {
    if (ezpaarseJobs[streamName]) {
      ezpaarseJobs[streamName].writeStream.write(log + '\n');
    }
    if (bibliolog && bibliolog.connected) {
      bibliolog.write('+log|' + Array.prototype.slice.call(arguments, 0).join('|') + '\r\n');
    }
  });

  server.on('unknown', function (data) {
    if (bibliolog && bibliolog.connected) {
      bibliolog.write(data.join('|') + '\r\n');      
    }
  });

  server.on('-node', function (node) {
    if (bibliolog && bibliolog.connected) {
      bibliolog.write('-node|' + node + '\r\n');      
    }
  });
  server.on('+node', function (node, streams) {
    if (bibliolog && bibliolog.connected) {
      bibliolog.write('+node|' + node + '|' + streams.join(',') + '\r\n');
    }
  });

}, config.autoConnectDelay);

/**
 * création des jobs ezpaarse et fait en sorte
 * de relancer les jobs terminés ou plantés
 * toutes les N secondes
 */
setInterval(function () {
  Object.keys(ezpaarseJobs).forEach(function (streamName) {
    // si le job est en cours, on ne fait rien
    if (ezpaarseJobs[streamName] !== null) return;

    console.error(new Date() + " - Création d'un job ezpaarse pour " + streamName);

    // sinon, création d'un nouveau job
    ezpaarseJobs[streamName] = {
      request: request.post({
        url: config.ezpaarse,
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
        msg += ' ' + data.platform_name;
        msg += ' ' + data.rtype;
        msg += ' ' + data.mime;
        msg += ' ' + (data.print_identifier || '-');
        msg += ' ' + (data.online_identifier || '-');
        msg += ' ' + (data.doi || '-');
        msg += ' ' + data.url;
        var logioMsg = '+log|' + streamName + '-ezpaarse' + '|bibliolog|info|' + msg;
        if (bibliolog && bibliolog.connected) {
          bibliolog.write(logioMsg + '\r\n');
        }
        if (bibliomap && bibliomap.connected) {
          data.ezproxyName = streamName;
          bibliomap.write(JSON.stringify(data) + '\n');
        }
        if (config.debug) {
          console.log(logioMsg);          
        }
      }));

    // vérifie que la connexion ezpaarse n'est pas fermée
    ezpaarseJobs[streamName].request.on('error', function (err) {
      console.error(new Date() + ' - "error" sur le job ezpaarse ' + streamName + ' [' + err + ']');
      delete ezpaarseJobs[streamName];
      ezpaarseJobs[streamName] = null;
      console.error(new Date() + ' - Nettoyage du job ezpaarse terminé sur ' + streamName);
    });
    ezpaarseJobs[streamName].request.on('close', function () {
      console.error(new Date() + ' - "close" sur le job ezpaarse ' + streamName);
      delete ezpaarseJobs[streamName];
      ezpaarseJobs[streamName] = null;
      console.error(new Date() + ' - Nettoyage du job ezpaarse terminé sur ' + streamName);
    });
    ezpaarseJobs[streamName].request.on('end', function () {
      console.error(new Date() + ' - "end" sur le job ezpaarse ' + streamName);
      delete ezpaarseJobs[streamName];
      ezpaarseJobs[streamName] = null;
      console.error(new Date() + ' - Nettoyage du job ezpaarse terminé sur ' + streamName);
    });

    ezpaarseJobs[streamName].request.on('response', function (response) {
      console.error(new Date() + ' - Job ' + response.headers['job-id'] + ' ok pour ' + streamName);
    });


    // // close each hours ezpaarse connections
    // // could help to stabilize bibliolog
    // setTimeout(function () {
    //   console.error(new Date() + ' - Aborting ezpaarse job ' + streamName);
    //   ezpaarseJobs[streamName].request.end();
    // }, 60 * 60 * 1000);

  }); // forEach streams
}, config.autoConnectDelay);

