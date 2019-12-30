FROM ubuntu:latest

RUN apt-get update && apt-get install -y vim wget curl nginx mongodb
RUN curl -o ~/.vimrc https://raw.githubusercontent.com/kaushikc92/scripts/master/.vimrc
RUN wget https://nodejs.org/dist/v12.13.1/node-v12.13.1-linux-x64.tar.xz
RUN mkdir -p /usr/local/lib/nodejs
RUN tar -xJf node-v12.13.1-linux-x64.tar.xz -C /usr/local/lib/nodejs
ENV PATH="/usr/local/lib/nodejs/node-v12.13.1-linux-x64/bin:${PATH}"

WORKDIR /api
COPY api/package.json .
COPY api/package-lock.json .
COPY api/src/ ./src/

RUN npm install

WORKDIR /ui
COPY ui/package.json .
COPY ui/package-lock.json .
COPY ui/src/ ./src/
COPY ui/public/ ./public/

RUN npm install
RUN npm run build

COPY nginx.conf /etc/nginx/
COPY debug/proxy.conf /etc/nginx/conf.d/

WORKDIR /
COPY templates/ templates/
COPY debug/entrypoint.sh /usr/local/bin/

#CMD (cd /api && node src/server.js &) && service nginx start
ENTRYPOINT ["entrypoint.sh"]
