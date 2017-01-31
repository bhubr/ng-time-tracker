
var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var id = 1;

app.use(bodyParser.json({ type: 'application/vnd.api+json' }));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/users', function (req, res) {
  console.log(req.params);
  console.log(req.body);
  var attrs = req.body.data.attributes;
  var newUser = {
  	'first-name': attrs['first-name'],
  	'last-name': attrs['last-name'],
  	'image-url': attrs['image-url']
  }
  var payload = { data: { id: id++, type: "users", attributes: newUser } };
  res.set('Content-Type', 'application/vnd.api+json');
  res.set('Accept', 'application/vnd.api+json');
  res.send(JSON.stringify(payload));

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