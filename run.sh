#!/bin/bash


today=`date +%Y%m%d`

sudo docker run -it --rm \
	-p 8545:8545 \
    -p 8080:8080 \
	-p 30303:30303 \
	-v /home/jerry/parity:/var/parity \
	-v /home/jerry/eth_monitor/dockerfiles/app/db:/eth_monitor/db \
    -e HTTP_USERNAME=eos \
    -e HTTP_PASSWORD=1q2w3e4r \
	"wangjia184/eth_monitor:$today"  #parity --jsonrpc --base-path=/var/parity --dapps-off --jsonrpc-interface=all --jsonrpc-port=8545 --port=30303;



#docker run -d --name="eth_monitor" --rm \
#    -p 8080:8080 \
#    -p 30303:30303 \
#    -v /docker_containers/parity_data:/var/parity \
#    -v /docker_containers/eos_data:/eth_monitor/db \
#    -e HTTP_USERNAME=eos \
#    -e HTTP_PASSWORD=1q2w3e4r \
#    "wangjia184/eth_monitor:20170701"