/**
 * Created by Benoît on 14/02/2017.
 */
const Promise = require('bluebird');
const configs = require(__dirname + '/config.json');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = configs[env];
const { query } = require('jsonapi-express-backend-query')(config.db);
const queryBuilder = require('./node_modules/jsonapi-express-backend/lib/queryBuilder');
const lockScreen = require('./lockScreen');
const { startIdleTimer, stopIdleTimer } = require('./notify');

var timer = {
  interval: null,
  startTimestamp: 0,
  lastTimestamp: 0,
  current: null
};

// const knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host : '127.0.0.1',
//     user : 'root',
//     password : '',
//     database : 'node_project_tracker_dev'
//   },
// });
// const bookshelf = require('bookshelf')(knex);

// const Project = bookshelf.Model.extend({
//   tableName: 'projects',
//   timers: function() {
//     return this.hasMany(Timer);
//   },
// });

// const Timer = bookshelf.Model.extend({
//   tableName: 'timers',
//   project: function() {
//     return this.belongsTo(Project);
//   },
//   initialize: function() {
//     this.on('created', this.startTimer, this);
//   },
//   startTimer: function( model, attrs, options ) {
//     return new Promise(function(resolve, reject) {
//       startTimer( model );
//       resolve(true);
//     });
//   }
// });

// const Option = bookshelf.Model.extend({
//   tableName: 'options'
// });
// module.exports = { Project, Timer, Option };

module.exports = {
  options: {

  },
  projects: {

  },
  timers: {
    relationships: {
      owner: {
        table: 'users',
        type: 'belongsTo',
        reverse: 'timers'
      }
    },
    hooks: {
      beforeCreate: attributes => {
        attributes.duration = parseInt(global.durations[attributes.type], 10);
        return Promise.resolve(attributes);
      },
      afterCreate: timerModel => {
        // WEIRD. Gotta store timer id b/c it gets erased from timerModel later on!!!
        const timerId = timerModel.id;
        const durationMs = timerModel.duration * 1000;
        let newValue;
        timer.current = timerModel;
        timer.lastTimestamp = timer.startTimestamp = (new Date()).getTime();
        console.log( 'starting timer with duration (s):', timerModel.duration);
        stopIdleTimer();
        timer.interval = setInterval( () => {
          newValue = (new Date()).getTime();
          // console.log('current: ' + newValue + ', prev: ' + timer.lastTimestamp+ ', diff: ' + (newValue - timer.lastTimestamp) );
          if( newValue - timer.startTimestamp >= durationMs ) {
            const dateTime = new Date().toMysqlFormat();
            const status = newValue - timer.lastTimestamp > 1050 ? 'interrupted' : 'done';
            query(queryBuilder.updateOne('timers', timerId, {
              status,
              stoppedAt: dateTime,
              updatedAt: dateTime
            }))
            .then( () => {
              clearInterval( timer.interval );
              timer.interval = null;
              timer.current = null;
              timer.lastTimestamp = 0;
              startIdleTimer();
              lockScreen();
            } );
          }
          timer.lastTimestamp = newValue;
        }, 1000 );

        return Promise.resolve(timerModel);
      }
    }
  },
  dailyposts: {
    relationships: {
      user: {
        table: 'users',
        type: 'belongsTo',
        reverse: 'dailyposts'
      }
    }
  },
  users: {
    relationships: {
      timers: {
        table: 'timers',
        type: 'hasMany',
        reverse: 'owner'
      },
      dailyposts: {
        table: 'dailyposts',
        type: 'hasMany',
        reverse: 'user'
      }
    }
  }
}