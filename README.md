# ezpaarse2log.io

Script used to parse in ezPAARSE log.io harvested log lines in real time.
This module is used by <a href="https://github.com/ezpaarse-project/bibliolog">bibliolog module</a> (show log analysis) or <a href="https://github.com/ezpaarse-project/bibliomap">bibliomap module</a> (show consultations in a map) or both.

<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&amp;h=519">


## Installation

```bash
git clone https://github.com/ezpaarse-project/ezpaarse2log.io.git
cd ezpaarse2log.io
npm install
```

## Usage

```bash
cd ezpaarse2log.io
node app.js
```

## Configuration

Default config:
```javascript
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

```

To overload config, create a config.local.js file.
Example:
```javascript
module.exports = {
  ezpaarse: {
    url: 'http://127.0.0.1:40010', // adjust if ezpaarse is installed elsewhere
    headers: {
      'Accept': 'application/jsonstream',
      'Double-Click-Removal': 'false',
      'ezPAARSE-Buffer-Size': 0,
      // use one EZproxy predefined settings : 
      // EZproxy (with user-agent) : %h %l %u %t "%r" %s %b "%{user-agent}<.*>"
      'ezPAARSE-Predefined-Settings': '00-ge-ezproxy-1'
    }
  }};
```
