#!/bin/bash
### BEGIN INIT INFO
# Provides:          ezpaarse2log.ios
# Required-Start:    $local_fs $remote_fs $network $syslog
# Required-Stop:     $local_fs $remote_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: Start and stop the ezpaarse2log.io application
### END INIT INFO

cd ~/ezpaarse2log.io/

ezpaarse2log.io_start() {
  NODE_ENV=production forever start --uid 'ezpaarse2log.io' -a -o ./logs/ezpaarse2log.io-stdout.log -e ./logs/ezpaarse2log.io-stderr.log ./app.js
}

ezpaarse2log.io_stop() {
  forever stop 'ezpaarse2log.io'
}

ezpaarse2log.io_status() {
  forever list | grep 'ezpaarse2log.io'
}

case $1 in

  start)
    ezpaarse2log.io_start
  ;;

  stop)
    ezpaarse2log.io_stop
  ;;
  
  restart)
    ezpaarse2log.io_stop
    sleep 1
    ezpaarse2log.io_start
  ;;

  status)
    ezpaarse2log.io_status
  ;;

  *)
    echo "Usage: $0 {start|stop|restart|status}"
    exit 1
  ;;

esac





