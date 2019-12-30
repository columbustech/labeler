#!/bin/bash
cp -r /templates /storage/
mkdir /storage/public/
cp -r /ui/build/* /storage/public/
node /api/src/server.js &
mkdir /storage/data
mongod --dbpath /storage/data &
service nginx start
