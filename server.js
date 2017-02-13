var express = require('express');
var http = require('http');
// var Promise = require('bluebird');
// var fs = require('fs');
// var readFileAsync = Promise.promisify( fs.readFile );

var bodyParser = require('body-parser');
var utils = require('./utils');
var exec = require('child_process').exec;
var child;

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : '',
    database : 'node_project_tracker_dev'
  },
});
var bookshelf = require('bookshelf')(knex);

var timer = {
  interval: null,
  remaining: 0,
  current: null
};
const DURATION = 1500;

function lockScreen() {
  child = exec(__dirname + "/lock_session.exe", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
global.Project = bookshelf.Model.extend({
  tableName: 'projects',
});

function startTimer( model ) {
  timer.current = model;
  timer.remaining = DURATION;
  timer.interval = setInterval( () => {
    timer.remaining -= 1;
    if( timer.remaining === 0 ) {
      model.set( 'status', 'done' );
      clearInterval( timer.interval );
      timer.interval = null;
      model.save().then( () => {
        lockScreen();
      } );
    }
    console.log( timer.remaining );
  }, 1000 );
}
/**
 * http://wesleytsai.io/2015/07/28/bookshelf-bcrpyt-password-hashing/
 */
 global.Timer = bookshelf.Model.extend({
  tableName: 'timers',
  initialize: function() {
    this.on('created', this.startTimer, this);
  },
  startTimer: function( model, attrs, options ) {
    return new Promise(function(resolve, reject) {
      startTimer( model );
      resolve(true);
    });
  }
});

const tableObjMap = {
  projects: 'Project',
  timers: 'Timer'
}


/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/
Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};


/**
 * Setup Express
 */
var app = express();
app.use(express.static('public'));
app.use(bodyParser.json({ type: 'application/json' }));
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


app.post('/api/v1/:type', function (req, res) {
  const type = req.params.type;
  const objType = tableObjMap[type];
  const attributes = req.body.data.attributes;
  const snakedAttrs = Object.assign( {},
    utils.snakeAttributes(attributes), {
      created_at: new Date().toMysqlFormat(),
      updated_at: new Date().toMysqlFormat()
  } );
  const item = new global[objType](snakedAttrs);

  item.save().then(result => {
    var payload = { data: { id: result.attributes.id, type, attributes } };
    res.set('Content-Type', 'application/json');
    res.set('Accept', 'application/+json');
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