#!/bin/bash


today=`date +%Y%m%d`

sudo docker build -t="wangjia184/eth_monitor:$today" .
sudo docker push wangjia184/eth_monitor:$today
echo "wangjia184/eth_monitor:$today"