# bibliomap-enricher


Listen for [bibliomap-harvester](https://github.com/ezpaarse-project/bibliomap-harvester) data, send it to [ezPAARSE](https://github.com/ezpaarse-project/ezpaarse) for enrichments and send the result to [bibliomap-viewer](https://github.com/ezpaarse-project/bibliomap-viewer)



## Architecture

<p align="center">
<img src="https://docs.google.com/drawings/d/1bkxEEBL1kLzH76dkIYFzspYHOVajDjQHCijU3mxJLnM/pub?w=694&h=519" />
</p>

## Prerequisites

  * Docker and docker-compose


## Installation and running

As a standalone script, bibliomap-enricher is not very usefull. Please have a look to [bibliomap](https://github.com/ezpaarse-project/bibliomap) docker-compose.yml to understand how it can be orchestrated with required modules: [bibliomap-harvester](https://github.com/ezpaarse-project/bibliomap-harvester) and [bibliomap-viewer](https://github.com/ezpaarse-project/bibliomap-viewer)



## Configuration

Env variable can be used to customize it:

  * BBE_EZPAARSE_URL
  * BBE_EZPAARSE_PREDEF
  * BBE_LISTEN_HARVESTER_HOST
  * BBE_LISTEN_HARVESTER_PORT
  * BBE_BROADCAST_VIEWER_HOST
  * BBE_BROADCAST_VIEWER_PORT


Look at [config.json](hhttps://github.com/ezpaarse-project/bibliomap-enricher/blob/master/config.json) to see the default values.

## Developement

```
git clone git@github.com:ezpaarse-project/bibliomap-enricher.git
cd bibliomap-enricher
DEBUG=bibliomap* make run-debug
```
