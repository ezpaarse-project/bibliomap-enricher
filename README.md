# ezpaarse2log.io

Script used to parse in ezPAARSE log.io harvested log lines in real time.

<img src="https://docs.google.com/drawings/d/1wx-IudPtbiFurr8FMr84JOEKgfoTSC7DffOu6Ev6RAk/pub?w=828&amp;h=350">

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
}
```

To overload config, create a config.local.js file.
Example:
```javascript
module.exports = {
  ezpaarse: 'http://127.0.0.1:40010'
};
```
