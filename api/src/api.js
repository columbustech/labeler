const express = require('express');
const request = require('request');
const fs = require('fs');
const router = express.Router();
const mongo = require('mongodb').MongoClient;
const csv = require('csv-parser');
const publicPath = '/storage/public/';
const templatesPath = '/storage/templates/';

router.get('/specs', function(req, res) {
  res.json({
    clientId: process.env.COLUMBUS_CLIENT_ID,
    authUrl: process.env.AUTHENTICATION_URL,
    cdriveUrl: process.env.CDRIVE_URL,
    cdriveApiUrl: process.env.CDRIVE_API_URL,
    username: process.env.COLUMBUS_USERNAME
  });
});

router.post('/access-token', function(req, res) {
  var code = req.body.code;
  var redirect_uri = req.body.redirect_uri;

  const options = {
    url: `${process.env.AUTHENTICATION_URL}o/token/`,
    form: {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: redirect_uri,
      client_id: process.env.COLUMBUS_CLIENT_ID,
      client_secret: process.env.COLUMBUS_CLIENT_SECRET
    }
  };

  var nestRes = request.post(options);
  nestRes.pipe(res);
});

router.post('/create-task', function(req, res) {
  var taskName = req.body.taskName;
  if (!taskName) {
    return res.status(400).json({
      error: 'Missing task name'
    });
  }
  var template = req.body.template;
  if(!template) {
    return res.status(400).json({
      error: 'Missing template name'
    });
  }
  var examplesPath = req.body.examplesPath;
  if(!examplesPath) {
    return res.status(400).json({
      error: 'Missing CDrive path to examples folder'
    });
  }
  var labelsPath = req.body.labelsPath;
  if(!labelsPath) {
    return res.status(400).json({
      error: 'Missing CDrive path to labels file'
    });
  }
  var accessToken = req.body.accessToken;
  if(!accessToken) {
    return res.status(403).json({
      error: 'Access token not provided or invalid'
    });
  }
  if(fs.existsSync(publicPath + taskName)) {
    return res.status(400).json({
      error: `Task with name ${taskName} already exists`
    });
  }
  fs.mkdirSync(publicPath + taskName);
  if(!fs.existsSync(templatesPath + template)) {
    return res.status(400).json({
      error: 'Invalid template name'
    });
  }
  fs.copyFileSync(`${templatesPath}${template}/example.html`, `${publicPath}${taskName}/example.html`);

  var options = {
    url: `${process.env.CDRIVE_API_URL}list-recursive/?path=${examplesPath}`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  };
  request(options, function(err, nestRes, body) {
    if(err) {
      return res.status(err.statusCode).json({
        error: 'Error reading input data from CDrive'
      });
    }
    let folderStruct = JSON.parse(body).driveObjects;
    async function asyncCDriveDownload(cDrivePath, localPath) {
      return new Promise(resolve => {
        var downloadUrlOptions = {
          url: `${process.env.CDRIVE_API_URL}download/?path=${cDrivePath}`,
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        };
        request(downloadUrlOptions, function(urlErr, urlRes, urlBody) {
          if(urlErr) {
            return res.status(urlErr.statusCode).json({
              error: 'CDrive download error'
            });
          }
          let downloadUrl = JSON.parse(urlBody).download_url;
          request.get(downloadUrl).pipe(fs.createWriteStream(localPath).on('finish', function() {
            resolve(true);
          }));
        });

      });
    }
    const promises = []
    function processFolder(fstruct, localPath) {
      fstruct.forEach(element => {
        if(element.type === 'Folder' ) {
          processFolder(element.children, `${localPath}/${element.name}`);
        } else {
          promises.push(asyncCDriveDownload(element.path, `${localPath}/${element.name}`));
        }
      });
    }
    processFolder(folderStruct, publicPath + taskName);
    Promise.all(promises).then(() => {
      exampleCount = 0;
      fs.createReadStream(`${publicPath}${taskName}/examples.csv`).pipe(csv()).on('data', (row) => {
        exampleCount++;
      }).on('end', () => {
        const mongoUrl = 'mongodb://localhost:27017';
        mongo.connect(mongoUrl, function(connectErr, client) {
          const db = client.db('labeler');
          const collection = db.collection('tasks');
          collection.insertOne({taskName: taskName, count: exampleCount}, (insertErr, insertResult) => {
            const taskCollection = db.collection(taskName);
            var exampleDocs = Array.apply(null, Array(exampleCount)).map(function(_, i) {
              return ({
                exampleNo: i+1,
                label: ""
              });
            });
            taskCollection.insertMany(exampleDocs, (labelErr, labelResult) => {
              client.close();
              var optionsPromise = asyncCDriveDownload(labelsPath, `${publicPath}${taskName}/options.json`);
              optionsPromise.then(() => {
                res.json({
                  message: 'success'
                });
              });
            });
          });
        });
      });
    });
  });
});

router.get('/list-tasks', function(req, res) {
  const mongoUrl = 'mongodb://localhost:27017';
  mongo.connect(mongoUrl, function(connectErr, client) {
    const db = client.db('labeler');
    const collection = db.collection('tasks');
    collection.find({}, {fields: {taskName: 1, _id: 0}}).toArray(function(err, results) {
      client.close();
      res.json({
        tasks: results
      });
    });
  });
});

router.get('/next-example', function(req, res) {
  const taskName = req.query.taskName;
  const mongoUrl = 'mongodb://localhost:27017';
  mongo.connect(mongoUrl, function(connectErr, client) {
    const db = client.db('labeler');
    const taskCollection = db.collection(taskName);
    taskCollection.findOne({label: ""}, function(exampleErr, exampleDoc) {
      client.close();
      if(exampleDoc) {
        res.json({
          exampleNo: exampleDoc.exampleNo
        });
      } else {
        res.json({
          exampleNo: -1
        });
      }
    });
  });
});

router.get('/label-options', function(req, res) {
  const taskName = req.query.taskName;
  fs.readFile(`${publicPath}${taskName}/options.json`, (err, data) => {
    res.json(JSON.parse(data));
  });
});

module.exports = router;
