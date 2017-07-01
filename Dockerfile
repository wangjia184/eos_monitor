FROM debian:jessie
MAINTAINER Jerry.Wang <jerry.wang@everymatrix.com>


RUN apt-get -qq update; 
RUN apt-get install -y openssl curl supervisor;

RUN curl -sL https://deb.nodesource.com/setup_6.x | bash -; \
	apt-get install -y nodejs; \
	node -v; \
	npm -v;

ADD parity /usr/bin/parity
RUN chmod +x /usr/bin/parity;


VOLUME ["/var/parity", "/eth_monitor/db"]



RUN apt-get install -y libgmp-dev build-essential
ADD  app/package.json /eth_monitor/package.json
ADD secp256k1-v3.3.0-node-v48-linux-x64.tar.gz /root/.npm/_prebuilds/https-github.com-cryptocoinjs-secp256k1-node-releases-download-v3.3.0-secp256k1-v3.3.0-node-v48-linux-x64.tar.gz
RUN cd /eth_monitor; npm update



ADD  entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

CMD /entrypoint.sh

COPY app/*.js /eth_monitor/
COPY app/www /eth_monitor/www

COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
