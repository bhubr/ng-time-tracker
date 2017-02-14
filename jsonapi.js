var utils = require('./utils');
var _ = require("lodash");
_.mixin(require("lodash-inflection"));
var express = require('express')
var router = express.Router()
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
  timers: function() {
    return this.hasMany(Timer);
  },
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
  }, 1000 );
}
/**
 * http://wesleytsai.io/2015/07/28/bookshelf-bcrpyt-password-hashing/
 */
 global.Timer = bookshelf.Model.extend({
  tableName: 'timers',
  project: function() {
    return this.belongsTo(Project);
  },
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

var timer = {
  interval: null,
  remaining: 0,
  current: null
};
const DURATION = 1500;


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

// define the home page route
router.get('/:table', (req, res) => {
  const table = req.params.table;
  knex.select().from(req.params.table)
  .then(records => utils.mapRecords(records, table))
  .then(res.jsonApi);
});

// define the home page route
router.post('/:type', (req, res) => {
  const type = req.params.type;
  const objType = _.titleize( _.singularize( type ) );
  const attributes = req.body.data.attributes;
  const processedAttrs = processAttributes( attributes, true );
  const item = new global[objType](processedAttrs);
  item.save()
  .then( record => mapRecordToPayload( record, type, attributes ) )
  .then( res.jsonApi );
} );

// define the home page route
router.put('/:type/:id', (req, res) => {
  const id = req.params.id;
  const type = req.params.type;
  const objType = _.titleize( _.singularize( type ) );
  const attributes = req.body.data.attributes;
  const processedAttrs = processAttributes( attributes );
  new global[objType]({ id }).save( processedAttrs )
  .then( record => { console.log( '## updated'); console.log(record); return record; } )
  .then( record => mapRecordToPayload( record, type, attributes ) )
  .then( res.jsonApi );
} );
module.exports = router;


function mapRecordToPayload( record, type, attributes ) {
  return { id: record.attributes.id, type, attributes };
}

function processAttributes( attributes, doCreate ) {
  let updated_at = new Date().toMysqlFormat();
  let outputAttrs = Object.assign( {},
    utils.snakeAttributes( attributes ),
    { updated_at }
  );
  if( doCreate ) {
    outputAttrs.created_at = updated_at;
  }
  return outputAttrs;
}



// http://stackoverflow.com/questions/31095969/how-do-i-do-atomic-update-using-bookshelf-js-model
function updateResource( req, res ) {

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
    res.jsonApi(payload);
  });
}
// app.post('/api/v1/:type', function (req, res) {

// });


