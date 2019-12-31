#!/bin/bash
cp -r /templates /storage/
mkdir -p /storage/public/
cp -r /ui/build/* /storage/public/
node /api/src/server.js &
mkdir -p /storage/data
mongod --dbpath /storage/data &
service nginx start
