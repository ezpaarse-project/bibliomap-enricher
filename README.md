# ezpaarse2log.io

Script used to listen [ezpaarse2log.io-harvester](https://github.com/ezpaarse-project/ezpaarse2log.io-harvester) logs, send it to an ezPAARSE instance, catching the results and sending it in real time to [bibliomap](https://github.com/ezpaarse-project/bibliomap) using the [log.io protocol](http://logio.org/).

<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&amp;h=519">

## Prerequisites

Docker and docker-compose installed on each servers.

A 1st server hosts ezproxy daemons and especially your ezproxy raw log files (assume that server ip or hostname is: **{ezproxy-server}**) : you have to install and configure [ezpaarse2log.io-harvester](https://github.com/ezpaarse-project/ezpaarse2log.io-harvester) on it.

A 2nd server hosts ezpaarse2log.io, ezpaarse and bibliomap (assume that server ip or hostname is: **{bibliomap-server}**). You have to install ezpaarse on **{bibliomap-server}** and run it :

```bash
git clone https://github.com/ezpaarse-project/ezpaarse.git
cd ezpaarse/
git checkout `git describe --tags --abbrev=0`
make
make start
```

## Installation

On the **{bibliomap-server}**

TODO

## Configuration

TODO

## Running ezpaarse2log.io

### Start, Status, Stop

TODO

### Monitoring (log files)

TODO