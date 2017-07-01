#!/bin/bash



useradd --create-home -s /bin/false docker_user
chown -R docker_user /eth_monitor;


/usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
