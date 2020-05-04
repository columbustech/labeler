#!/bin/bash
mkdir -p /storage/data
mongod --dbpath /storage/data &
mkdir -p /storage/public/
#cp -r /ui/build/* /storage/public/
#pm2 start /api/src/server.js
#node src/server.js &
service nginx start
