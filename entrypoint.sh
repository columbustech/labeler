#!/bin/bash
cp -r /templates /storage/
mkdir -p /storage/data
mongod --dbpath /storage/data &
mkdir -p /storage/public/
#(cd /ui && npm run build)
(cd /ui && PUBLIC_URL="$CDRIVE_URL"app/"$COLUMBUS_USERNAME"/labeler npm run build)
cp -r /ui/build/* /storage/public/
pm2 start /api/src/server.js
#node src/server.js &
service nginx start
