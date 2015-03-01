# ezpaarse2log.io

Script used to parse in ezPAARSE log.io harvested log lines in real time.

This module is used by <a href="https://github.com/ezpaarse-project/bibliolog">bibliolog module</a> (show log analysis) or <a href="https://github.com/ezpaarse-project/bibliomap">bibliomap module</a> (show consultations in a map) or both.

<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&amp;h=519">

## Prerequisites

  * 2 serveurs with Linux OS (ex: debian or ubuntu)
    * 1st server hosts ezproxy daemons and especially your ezproxy raw log files (assume that server ip or hostname is: **{ezproxy-server}**)
    * 2nd server hosts ezpaarse2log.io and bibliolog or bibliomap (or both) (assume that server ip or hostname is: **{ezpaarse2log-io-server}**)
  * Install curl and git on **{ezpaarse2log-io-server}** and **{ezproxy-server}**:
```bash
sudo apt-get install curl git
```
  * Install NodeJS on **{ezpaarse2log-io-server}** and **{ezproxy-server}**:
```bash
curl https://raw.githubusercontent.com/creationix/nvm/v0.5.1/install.sh | sh
nvm install 0.10
nvm use 0.10
nvm alias default 0.10
```
  * Install Log.io as a global command on **{ezpaarse2log-io-server}** and **{ezproxy-server}** :
```bash
npm install -g log.io@0.3.2
```
## Installation

```bash
git clone https://github.com/ezpaarse-project/ezpaarse2log.io.git
cd ezpaarse2log.io
npm install
```

## Configuration

### log.io-harvester (raw log server side)

You have to configure ``log.io-harvester`` on **{ezproxy-server}** in order to:
  - listen for your ezproxy(s) log file
  - send data to the **{ezpaarse2log-io-server}** (port 28777)

Here is a config file example which should be located at ``~/.log.io/harvester.conf``
```javascript
exports.config = {                                                                                      
  nodeName: "bibliolog",                                                                                
  logStreams: {                                                                                         
    bibliovie:      [ "/ezproxyvie/ezproxy.log" ],                    
    biblioplanets:  [ "/ezproxypla/ezproxy.log" ],                    
    biblioshs:      [ "/ezproxyshs/ezproxy.log" ],                    
    titanesciences: [ "/ezproxychim/ezproxy.log" ],
    bibliost2i:     [ "/ezproxyst2i/ezproxy.log" ],
    bibliosciences: [ "/ezproxybbs/ezproxy.log" ],
    biblioinserm:   [ "/ezproxyinserm/ezproxy.log" ],
    archivesiop:    [ "/ezproxyiop/ezproxy.log" ]
  },
  server: {
    host: '{bibliolog-server}',
    port: 28777
  }
}
```
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

Example for ezproxy logs with user agent :
```bash
echo "module.exports = {
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
  }};" > ./config.local.js
```
## Running ezpaarse2log.io

### Start

On **{ezproxy-server}**:
```bash
log-io.harvester
```
On **{bibliolog-server}** (or bibliomap):
```bash
./etc/init.d/bibliolog start
```
On **{ezpaarse2log-io-server}**:
```bash
./etc/init.d/ezpaarse2log.io start
```

### Status

```bash
./etc/init.d/ezpaarse2log.io status
```

### Stop

```bash
./etc/init.d/ezpaarse2log.io stop
```

### Monitoring (log files)

```bash
tail -f ./logs/ezpaarse2log.io-server-stderr.log
tail -f ./logs/ezpaarse2log.io-stdout.log
```
