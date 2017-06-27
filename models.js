/**
 * Created by Benoît on 14/02/2017.
 */
const Promise = require('bluebird');
const timerUtils = require('./timerUtils');

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
      },
      timers: {
        model: 'timer',
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
      },
      timers: {
        model: 'timer',
        type: 'hasMany',
        reverse: 'issue'
      }
    }
  },
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
      },
      issue: {
        model: 'issue',
        type: 'belongsTo',
        reverse: 'timers'
      },
      project: {
        model: 'project',
        type: 'belongsTo',
        reverse: 'timers'
      }
    },
    hooks: {
      beforeCreate: attributes => {
        attributes.duration = parseInt(global.durations[attributes.type], 10);
        return Promise.resolve(attributes);
      },
      afterCreate: timerUtils.afterCreate
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