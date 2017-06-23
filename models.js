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
  option: {
    relationships: {}
  },
  project: {
    relationships: {
      owner: {
        model: 'user',
        type: 'belongsTo',
        reverse: 'projects'
      },
      remoteProject: {
        model: 'remoteProject',
        type: 'belongsTo',
        reverse: 'localProject'
      },
      issues: {
        model: 'issue',
        type: 'hasMany',
        reverse: 'project'
      }
    }
  },
  apiToken: {
    relationships: {
      account: {
        model: 'account',
        type: 'belongsTo',
        reverse: 'apiToken'
      }
    }
  },
  account: {
    relationships: {
      remoteProjects: {
        model: 'remoteProject',
        type: 'hasMany',
        reverse: 'account'
      },
      apiToken: {
        model: 'apiToken',
        type: 'belongsTo',
        reverse: 'account'
      }
    }
  },
  issue: {
    relationships: {
      project: {
        model: 'project',
        type: 'belongsTo',
        reverse: 'issues'
      },
      remote: {
        model: 'remoteProject',
        type: 'belongsTo',
        reverse: 'issues'
      }
    }
  }
  remoteProject: {
    relationships: {
      account: {
        model: 'account',
        type: 'belongsTo',
        reverse: 'remoteProjects'
      },
      localProject: {
        model: 'project',
        type: 'belongsTo',
        reverse: 'remoteProject'
      },
      issues: {
        model: 'issue',
        type: 'hasMany',
        reverse: 'remote'
      }
    }
  },
  timer: {
    relationships: {
      owner: {
        model: 'user',
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
  dailyPost: {
    relationships: {
      user: {
        model: 'user',
        type: 'belongsTo',
        reverse: 'dailyposts'
      }
    }
  },
  user: {
    relationships: {
      timers: {
        model: 'timer',
        type: 'hasMany',
        reverse: 'owner'
      },
      projects: {
        model: 'project',
        type: 'hasMany',
        reverse: 'owner'
      },
      dailyposts: {
        model: 'dailyPost',
        type: 'hasMany',
        reverse: 'user'
      }
    }
  }
}