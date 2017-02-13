var express = require('express');
var http = require('http');
// var Promise = require('bluebird');
// var fs = require('fs');
// var readFileAsync = Promise.promisify( fs.readFile );
var bodyParser = require('body-parser');

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    project : 'root',
    password : '',
    database : 'node_project_tracker_dev'
  },
});
var bookshelf = require('bookshelf')(knex);

var Project = bookshelf.Model.extend({
  tableName: 'projects',
  // posts: function() {
  //   return this.hasMany(Posts);
  // }
});
var app = express();
app.use(express.static('public'));

var id = 1;

//var convertAttributes = require('./convert-attributes');
var utils = require('./utils');

app.use(function(req, res, next) {
  res.jsonApi = function(data) {
    console.log(data);
    res.set({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return res.send(JSON.stringify({ data }));
  }
  next();
});

app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

// app.get('/', function (req, res) {
//   res.send('Hello World!');
// });

app.post('/api/v1/projects', function (req, res) {
  var attrs = req.body.data.attributes;
  var newProject = {
    'name': attrs['name'],
    'description': attrs['description'],
    // 'image-url': attrs['image-url']
  }
  var projectObj = utils.snakeAttributes(attrs);
  project = new User(projectObj);
  project.save().then(result => {
    console.log('id', result);
  var payload = { data: { id: result, type: "projects", attributes: newProject } };
  res.set('Content-Type', 'application/vnd.api+json');
  res.set('Accept', 'application/vnd.api+json');
  res.send(JSON.stringify(payload));

  });

});

app.get('/api/v1/:table', (req, res) => {
  // console.log(req.params);
  const table = req.params.table;
  knex.select().from(req.params.table)
  .then(records => utils.mapRecords(records, table))
  .then(res.jsonApi);
});

app.listen(3001, function () {
  console.log('Example app listening on port 3001!');
});


// extract path from req
// extract model name from path
// extract relationships from model descriptor
// convert attribute names from score to lower camel

function processPayload(req, res, next) {

}