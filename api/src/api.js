const express = require('express');
const router = express.Router();
const request = require('request');
const fs = require('fs');
const mongo = require('mongodb').MongoClient;
const csv = require('csv-parser');
const mongoUrl = 'mongodb://localhost:27017';
const publicPath = '/storage/public/';
const templatesPath = '/storage/templates/';
var db;

function connectToDB() {
  mongo.connect(mongoUrl, function(err, client) {
    if (err) {
      console.log("Error connecting to DB");
      setTimeout(() => connectToDB(), 1000);
      return;
    }
    db = client.db('labeler');
  });
}

connectToDB();

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

function cDriveDownload(cDrivePath, localPath, accessToken) {
  return new Promise(resolve => {
    var downloadUrlOptions = {
      url: `http://cdrive/download/?path=${cDrivePath}`,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    };
    request(downloadUrlOptions, function(urlErr, urlRes, urlBody) {
      let downloadUrl = JSON.parse(urlBody).download_url;
      request.get(downloadUrl).pipe(fs.createWriteStream(localPath).on('finish', function() {
        resolve(true);
      }));
    });
  });
}

router.post('/create-task', function(req, res) {
  var accessToken = req.headers["authorization"].split(" ")[1];

  var retId = req.body.retId;
  var taskName = req.body.taskName;
  var template = req.body.template;
  var dataPath = req.body.dataPath;
  var examplesPath = req.body.examplesPath;
  var labelOptionsPath = req.body.labelOptionsPath;
  var completionUrl = req.body.completionUrl;
  var outputPath = req.body.outputPath;
  var outputName = req.body.outputName;

  fs.mkdirSync(publicPath + taskName);
  fs.copyFileSync(`${templatesPath}${template}/example.html`, `${publicPath}${taskName}/example.html`);

  function createTask() {
    return new Promise(resolve => {
      var exampleCount = 0;
      const taskCollection = db.collection(taskName);
      fs.createReadStream(`${publicPath}${taskName}/examples.csv`).pipe(csv()).on('data', (row) => {
        exampleCount++;
        taskCollection.insertOne({exampleNo: row["id"], label: ""}, (insErr, insRes) => {
        });
      }).on('end', () => {
        const collection = db.collection('tasks');
        collection.insertOne({taskName: taskName, count: exampleCount, completionUrl: completionUrl, outputPath: outputPath, outputName: outputName}, (insErr, insRes) => {
          resolve(true);
        });
      });
    });
  }

  const promises = []
  promises.push(cDriveDownload(dataPath, `${publicPath}${taskName}/data.csv`, accessToken));
  promises.push(cDriveDownload(examplesPath, `${publicPath}${taskName}/examples.csv`, accessToken));
  promises.push(cDriveDownload(labelOptionsPath, `${publicPath}${taskName}/options.json`, accessToken));
  
  Promise.all(promises).then(() => createTask()).then(() => {
    res.json({
      message: 'success'
    });
  });
});

router.get('/label-options', function(req, res) {
  const taskName = req.query.taskName;
  fs.readFile(`${publicPath}${taskName}/options.json`, (err, data) => {
    res.json(JSON.parse(data));
  });
});


router.get('/next-example', function(req, res) {
  const taskName = req.query.taskName;
  const taskCollection = db.collection(taskName);
	taskCollection.findOne({label: ""}, function(exampleErr, exampleDoc) {
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

router.get('/task-stats', function(req, res) {
  var taskName = req.query.taskName;
  let total, labels;

  const taskCollection = db.collection(taskName);
  taskCollection.countDocuments({}).then(countTotal => {
    total = countTotal;
  }).then(() => {
    return taskCollection.distinct('label', {});
  }).then(distLabels => {
    labels = distLabels.filter(item => item !== '');
  }).then(() => {
    const promises = [];
    labels.forEach(label => {
      promises.push(taskCollection.countDocuments({label: label}));
    });
    Promise.all(promises).then(values => {
      res.json({
        total: total,
        labels: labels,
        counts: values
      });
    });
  });
});

router.post('/label-example', function(req, res) {
  var taskName = req.body.taskName;
  var exampleNo = req.body.exampleNo;
  var label = req.body.label;
  const taskCollection = db.collection(taskName);
  taskCollection.update({exampleNo: exampleNo}, {exampleNo: exampleNo, label:label}, function(err, count, stat) {
    res.json({
      message: "success"
    });
  });
});

router.post('/delete', function(req, res) {
  var taskName = req.body.taskName;
	const collection = db.collection('tasks');
	const removePromise = collection.remove({taskName: taskName});
	const taskCollection = db.collection(taskName);
	const dropPromise =  taskCollection.drop();
	Promise.all([removePromise, dropPromise]).then(function(values) {
		fs.rmdir(`${publicPath}${taskName}/`, {recursive: true}, function(delErr) {
			res.json({
				message: 'success'
			});
		});
	});
});

router.post('/clear', function(req, res) {
  var taskName = req.body.taskName;
  const taskCollection = db.collection(taskName);
  taskCollection.updateMany({}, { $set: {label: ""} }, function(updateErr, updateRes) {
    res.json({
      message: 'success'
    });
  });
});

module.exports = router;
