FROM columbustech/mern-base

#WORKDIR /api
#COPY api/package.json .
#COPY api/package-lock.json .
#COPY api/src/ ./src/
#RUN npm install
#
#RUN npm install pm2 -g
#
#WORKDIR /ui
#COPY ui/package.json .
#COPY ui/package-lock.json .
#COPY ui/src/ ./src/
#COPY ui/public/ ./public/
#RUN npm install

COPY entrypoint.sh /usr/local/bin/
COPY proxy.conf /etc/nginx/conf.d/

#WORKDIR /api

ENTRYPOINT ["entrypoint.sh"]
