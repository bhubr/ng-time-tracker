
var express = require('express');
var http = require('http');
express.response

var bodyParser = require('body-parser')
var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : '',
    database : 'celeb_dev'
  },
  // migrations: {
  //   tableName: 'migrations'
  // }
});
var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users',
  // posts: function() {
  //   return this.hasMany(Posts);
  // }
});
var app = express();
var id = 1;

//var convertAttributes = require('./convert-attributes');
var utils = require('./utils');

app.use(function(req, res, next) {
  res.jsonApi = function(data) {
    console.log(data);
    res.set({
      'Content-Type': 'application/vnd.api+json',
      'Accept': 'application/vnd.api+json'
    });
    return res.send(JSON.stringify({ data }));
  }
  next();
});

app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/api/v1/users', function (req, res) {
  console.log(req.params);
  console.log(req.body);
  var attrs = req.body.data.attributes;
  var newUser = {
    'first-name': attrs['first-name'],
    'last-name': attrs['last-name'],
    'image-url': attrs['image-url']
  }
  var userObj = utils.snakeAttributes(attrs);
  console.log(userObj);
  user = new User(userObj);
  user.save().then(result => {
    console.log('id', result);
  var payload = { data: { id: result, type: "users", attributes: newUser } };
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