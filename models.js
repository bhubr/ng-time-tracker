/**
 * Created by Benoît on 14/02/2017.
 */
const lockScreen = require('./lockScreen');
const eventHub = require('./eventHub');
const { startIdleTimer, stopIdleTimer } = require('./notify');

function startTimer( model ) {
  timer.current = model;
  timer.remaining = parseInt(global.durations[model.attributes.type], 10);
  console.log( 'starting timer with duration (s):', timer.remaining);
  stopIdleTimer();
  timer.interval = setInterval( () => {
    timer.remaining -= 1;
    if( timer.remaining === 0 ) {
      const dateTime = new Date().toMysqlFormat();
      model.set({
        status: 'done',
        stoppedAt: dateTime,
        updatedAt: dateTime
      } );
      clearInterval( timer.interval );
      timer.interval = null;
      startIdleTimer();
      model.save().then( () => {
        lockScreen();
      } );
    }
  }, 1000 );
}

var timer = {
  interval: null,
  remaining: 0,
  current: null
};

const knex = require('knex')({
  client: 'mysql',
  connection: {
    host : '127.0.0.1',
    user : 'root',
    password : '',
    database : 'node_project_tracker_dev'
  },
});
const bookshelf = require('bookshelf')(knex);

const Project = bookshelf.Model.extend({
  tableName: 'projects',
  timers: function() {
    return this.hasMany(Timer);
  },
});

const Timer = bookshelf.Model.extend({
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

const Option = bookshelf.Model.extend({
  tableName: 'options'
});
module.exports = { Project, Timer, Option };