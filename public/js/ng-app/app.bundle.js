webpackJsonp([0],{

/***/ 118:
/***/ (function(module, exports) {

function JwtConfig($httpProvider, jwtOptionsProvider) {
  // Please note we're annotating the function so that the $injector works when the file is minified
  jwtOptionsProvider.config({
    tokenGetter: ['authService', function(authService) {
      return authService.getToken();
    }]
  });

  $httpProvider.interceptors.push('jwtInterceptor');
}

module.exports = JwtConfig;

/***/ }),

/***/ 119:
/***/ (function(module, exports) {

RouterConfig.$inject = ['$routeProvider', '$httpProvider', '$locationProvider'];

function RouterConfig($routeProvider, $httpProvider, $locationProvider) {
  $routeProvider
  .when("/signin", {
    templateUrl : "signin.html",
    controller : "signinCtrl"
  })
  .when("/signup", {
    templateUrl : "signup.html",
    controller : "signupCtrl"
  })
  .when("/", {
    templateUrl : "dashboard.html",
    controller : "dashboardCtrl",
    resolve: {
      data: ['dataStoreService', function(dataStoreService) {
        return dataStoreService.get(['projects', 'options', 'timers']);
      }]
    }
  })
  .when("/projects", {
    templateUrl : "projects.html",
    controller : "projectsCtrl",
    resolve: {
      flatUiColors: ['$http', function($http) {
        return $http.get('/flat-ui-colors.json')
        .then(response => (response.data));
      }]
    }
  })
  .when("/timer", {
    templateUrl : "timer.html",
    controller : "timerCtrl",
    resolve: {
      currentUser: ['authService', function(authService) {
        return authService.getCurrentUser();
      }]
    }
  })
  .when("/stats", {
    templateUrl : "stats.html",
    controller : "statsCtrl"
  });

  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false,
    rewriteLinks: true
  });

}
module.exports = RouterConfig;

/***/ }),

/***/ 120:
/***/ (function(module, exports) {

function TranslationConfig($translateProvider) {
  $translateProvider.translations('en', {
    ACTIVE_PROJECTS: 'Active projects',
    LAST_7_DAYS: 'last 7 days',
    LATEST_TIMERS: 'Latest timers',
  });
  $translateProvider.preferredLanguage('en');
}

module.exports = TranslationConfig;

/***/ }),

/***/ 121:
/***/ (function(module, exports) {

DashboardController.$inject = ['$scope', 'lodash', 'moment', 'data'];

function DashboardController($scope, _, moment, data) {
  var numTimers = data.timers.length;
  var sortedTimers = _.sortBy(data.timers, 'createdAt');
  $scope.latestTimers = _.slice(sortedTimers, numTimers - 5);
  var dateNow = moment().subtract(7, 'days');
  // dateNow mo;
  // .toDate();
  console.log(dateNow.toDate(), new Date());
  var recentTimers = _.filter(sortedTimers, function(t) {
    return moment(t.createdAt).diff(dateNow, 'minutes') > 0;
  });
  var recentProjectIds = _.map(recentTimers, 'projectId');
  $scope.activeProjects = _.filter(data.projects, function(p) {
    return recentProjectIds.indexOf(p.id) !== -1;
  });
  console.log($scope.recentTimers, recentProjectIds);
}

module.exports = DashboardController;

/***/ }),

/***/ 122:
/***/ (function(module, exports) {

MainController.$inject = ['$rootScope', '$scope', '$location', 'authService'];

function MainController($rootScope, $scope, $location, authService) {
  $scope.logout = function() {
    authService.signout();
    $location.path('/signin');
  }
}

module.exports = MainController;

/***/ }),

/***/ 123:
/***/ (function(module, exports) {

ProjectsController.$inject = ['$scope', '$http', 'lodash', 'flatUiColors', 'jsonapiUtils'];

 function ProjectsController($scope, $http, lodash, flatUiColors, jsonapiUtils) {

  $scope.projects = [];
  $scope.name = '';
  $scope.description = '';
  $scope.colors = flatUiColors;
  console.log($scope.colors);
  $scope.color = '#fff';

  $scope.createProject = function() {
    const { name, description, color } = $scope;
    $scope.name = '';
    $scope.description = '';
    
    $http.post("/api/v1/projects",
    { data: { attributes: { name, description, color } } } )
    .then(function(response) {
      const newProject = mapAttributes( response.data.data );
      $scope.projects.push( newProject );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  $scope.pickColor = function( evt ) {
    $scope.color = $( evt.target ).data( 'color' );
  }

  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    // $scope.projects = response.data.data.map( mapAttributes );
    $scope.projects = jsonapiUtils.unmapRecords(response.data.data);
  })
  .catch(err => {
    $scope.statustext = err;
  } );

}

module.exports = ProjectsController;

/***/ }),

/***/ 124:
/***/ (function(module, exports) {

SigninController.$inject = ['$rootScope', '$scope', '$location', 'authService'];

function SigninController($rootScope, $scope, $location, authService) {
  $scope.payload = {
    email: '',
    password: ''
  };

  $scope.signin = function() {
    authService.signin($scope.payload)
    .then(() => $location.path('/'));
  }
}

module.exports = SigninController;

/***/ }),

/***/ 125:
/***/ (function(module, exports) {

SignupController.$inject = ['$rootScope', '$scope', 'authService'];

function SignupController($rootScope, $scope, authService) {
  // $scope.payload = {
  //   email: '',
  //   username: '',
  //   firstName: '',
  //   lastName: '',
  //   password: '',
  // };

  $scope.signup = function() {
    authService.signup($scope.payload);
  }
}

module.exports = SignupController;

/***/ }),

/***/ 126:
/***/ (function(module, exports) {

StatsController.$inject = ['$scope', 'dataStoreService', 'lodash'];

function StatsController($scope, store, lodash) {

  $scope.data = [];

  function getDates(firstDay, stopDate) {
    var dateArray = new Array();
    var currentDate = new Date(firstDay);
    console.log(currentDate);
    while (currentDate <= stopDate) {
        dateArray.push( ( new Date (currentDate) ).toISOString().substr(0,10) );
        currentDate.setDate( currentDate.getDate() + 1 );
    }
    return dateArray;
}
  $scope.title = 'Daily stats';
  store.get(['projects', 'timers'])
  .then(({ projects, timers }) => {
    const todayDate = new Date();
    const firstDay = timers.reduce((oldestDay, timer) => {
      const timerDay = timer.createdAt.substr(0,10);
      return timerDay < oldestDay ? timerDay : oldestDay;
    }, todayDate.toISOString().substr(0,10));

    const daysArr = getDates(firstDay, todayDate);
    console.log(daysArr);

    const timersByDay = lodash.groupBy(timers, timer => (timer.createdAt.substr(0, 10)));
    const dataByDay = daysArr.map((day, dayIdx) => {
      const timersForDay = timersByDay[day] !== undefined ? timersByDay[day] : [];
      const timersByProj = lodash.countBy(timersForDay, timer => (timer.projectId));
      return projects.reduce((dataBefore, project, projIdx) => {
        const numTimers = timersByProj[project.id] !== undefined ? timersByProj[project.id] : 0;
        const y0 = dataBefore.reduce((totalBefore, obj) => { return totalBefore + obj.y; }, 0);
        return dataBefore.concat([{
          key: project.name,
          series: projIdx, // stream (project) index
          size: numTimers, // # of timers for project
          x: dayIdx, // day index
          y: numTimers, // equals size
          y0, // # of timers before
          y1: y0 + numTimers, // # y0 + size
        }]);
      }, []);
    });

    $scope.options = {
        chart: {
            type: 'multiBarChart',
            height: 450,
            margin : {
                top: 20,
                right: 20,
                bottom: 45,
                left: 45
            },
            clipEdge: true,
            duration: 500,
            stacked: true,
            xAxis: {
                axisLabel: 'Time (ms)',
                showMaxMin: false,
                tickFormat: function(d){
                    return daysArr[d];
                }
            },
            yAxis: {
                axisLabel: 'Y Axis',
                axisLabelDistance: -20,
                tickFormat: function(d){
                    return d;
                }
            }
        }
    };

    $scope.data = projects.map((project, projIdx) => {
      let obj = {
        key: project.name
      };
      obj.values = dataByDay.map(valuesForDay => (valuesForDay[projIdx]));
      return obj;
    });

  });
}

module.exports = StatsController;

/***/ }),

/***/ 127:
/***/ (function(module, exports) {

const MYSQL_OFFSET = 7200;

TimersController.$inject = ['$scope', '$http', 'lodash', 'optionService', 'notificationService', 'jsonapiUtils', 'currentUser'];

function getTimersAndProjects( $scope, $http, lodash, optionService, jsonapiUtils ) {
  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    $scope.projects = jsonapiUtils.unmapRecords(response.data.data);
  })
  .then( () => $http.get("/api/v1/timers") )
  .then(function(response) {
    $scope.timers = jsonapiUtils.unmapRecords(response.data.data);
    $scope.timers.forEach( (timer, index, timers) => {
      if( timer.projectId ) {
        timers[index].project = lodash.find( $scope.projects, { id: timer.projectId } );
      }
    } );
    $scope.allTimers = $scope.timers;
    $scope.lastTimer = lodash.findLast( $scope.timers, { status: 'new' } );
    if( $scope.lastTimer !== undefined ) {
      var timeStampStart = new Date( $scope.lastTimer.createdAt ).getTime();
      var timeStampNow = Date.now();
      console.log('timer start, now, diff:', timeStampStart, timeStampNow, Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET);
      var timeDiff = Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET;
      if( timeDiff < optionService.get('pomodoro') ) {
        $scope.startTimer( optionService.get('pomodoro') - timeDiff );
        $scope.currentTimer = $scope.lastTimer;
      }
    }
  })
  .catch(err => {
    $scope.statustext = err;
  } );
}

function TimersController($scope, $http, lodash, optionService, notificationService, jsonapiUtils, currentUser) {

  // const DURATION_POMO = 5;
  // const IDLE = 0;
  // const RUNNING = 1;
  // $scope.timerStatus = IDLE;
  // console.log('timerCtrl', optionService.get('pomodoro'), currentUser);
  // $scope.currentUser = currentUser;
  $scope.timer = null;
  $scope.timeRemaining = 0;
  $scope.lastTimer = {};
  $scope.currentTimer = {};
  $scope.allTimers = [];
  $scope.timers = [];
  $scope.projects = [];
  $scope.projectOptions = [];
  $scope.statuses = ['new', 'done', 'interrupted'];
  $scope.filters = {
    project: null
  };
  $scope.$watch('filters', filters, true);
  $scope.$watch('projects', projectOptions, true);

  function projectOptions() {
    $scope.projectOptions = [{ id: 0, name: '' }].concat($scope.projects);
  }

  function filters() {
    $scope.timers = ! $scope.filters.project ? $scope.allTimers :
      lodash.filter($scope.allTimers, timer => (timer.projectId === $scope.filters.project));
  }

  $scope.startTimer = function( duration ) {
    $scope.timeRemaining = duration === undefined ? optionService.get('pomodoro') : duration;
    $scope.timer = setInterval( () => {
      $scope.$apply(function(){
        $scope.timeRemaining -= 1;
        if( $scope.timeRemaining === 0 ) {
          clearInterval( $scope.timer );
          $scope.timer = null;
        }
      });
    }, 1000 );

  }

  $scope.select = function( evt ) {
    var $parentLi = $( evt.target ).closest('li');
    var id = parseInt( $parentLi.data( 'id' ), 10 );
    var timer = lodash.find( $scope.timers, { id } );
    $scope.currentTimer = timer;
  }

  $scope.createPomodoro = function() {
    const type = "pomodoro";
    $scope.currentTimer = null;
    $scope.startTimer();
    // console.log('before createPomodoro', $scope.currentUser, $scope.currentUser.id);

    $http.post("/api/v1/timers",
    {
      data: {
        type: 'timers',
        attributes: { type },
        relationships: {
          owner: { data: { type: 'users', id: currentUser.userId } }
        }
      }
    } )
    .then(function(response) {
      $scope.currentTimer = jsonapiUtils.unmapRecords(response.data.data);
      $scope.timers.push( $scope.currentTimer );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  $scope.updatePomodoro = function() {

    $http.put("/api/v1/timers/" + $scope.currentTimer.id, {
      data: {
        type: 'timers',
        id: $scope.currentTimer.id,
        attributes: {
          summary: $scope.currentTimer.summary,
          markdown: $scope.currentTimer.markdown,
          projectId: $scope.currentTimer.projectId
        }
      } 
    } )
    .then(function(response) {
      $scope.currentTimer = Object.assign( 
        $scope.currentTimer,
        jsonapiUtils.unmapRecord(response.data.data)
      );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  getTimersAndProjects( $scope, $http, lodash, optionService, jsonapiUtils );

}
module.exports = TimersController;

/***/ }),

/***/ 128:
/***/ (function(module, exports) {

AuthService.$inject = ['$rootScope', '$http', 'jwtHelper'];

function AuthService($rootScope, $http, jwtHelper) {

  let currentUser = null;

  function getToken() {
    return localStorage.getItem('id_token');
  }

  function setToken(jwt) {
    return localStorage.setItem('id_token', jwt);
  }

  function getCurrentUser() {
    return currentUser;
  }

  function init() {
    const token = getToken();
    if(token !== null) {
      console.log(token, typeof token);
      $rootScope.currentUser = currentUser = jwtHelper.decodeToken(token);
    }
    console.log('AuthService.init currentUser: ', currentUser);
  }


  return {
    setToken,
    getToken,
    getCurrentUser,
    init,

    signup: function(attributes) {
      return $http.post('/api/v1/users', { data:
       { type: "users", attributes } 
     })
      .then(function(response) {
        // var token = response.data.token;
        // self.
        // return { token: token, user: self.user };
        console.log(response);
      });
    },

    signin: function(attributes) {
      let token;
      const self = this;
      return $http.post('/api/v1/signin', { data: { attributes } })
      .then(response => {
        const { jwt, userId } = response.data.data;
        token = jwt;
        return $http.get('/api/v1/users/' + userId);
      })
      .then(response => {
        return response.data.data.attributes;
      })
      .then(user => {
        console.log(user, token);
        // localStorage.getItem('id_token');
        setToken(token);
        $rootScope.currentUser = currentUser = user;
        console.log(currentUser);
      });
      //   return { token: token, user: self.user };
      // });
    },

    signout: function() {
      localStorage.removeItem('id_token');
      $rootScope.currentUser = currentUser = null;
    } 

  };
}

module.exports = AuthService;


/***/ }),

/***/ 129:
/***/ (function(module, exports) {

/*----------------------------------------
 | Lang related stuff
 *----------------------------------------
 |
 */
JsonapiUtils.$inject = ['lodash'];

function JsonapiUtils(_) {

  function lowerFirstChar(string) {
    return string.charAt(0).toLowerCase() + string.substring(1);
  }

  function lowerCamelAttributes(attributes) {
    var newAttrs = {};
    for(var a in attributes) {
      var lowerCamelAttrKey = lowerFirstChar( _.camelCase(a));
      newAttrs[lowerCamelAttrKey] = attributes[a];
    }
    return newAttrs;
  }


  function kebabAttributes(attributes) {
    var newAttrs = {};
    for(var a in attributes) {
    var snakedAttrKey = _.kebabCase(a);
    newAttrs[snakedAttrKey] = attributes[a];
    }
    return newAttrs;
  }

  function unmapRecords(records) {
    return _.map(records, unmapRecord);
  }

  function unmapRecord(record) {
    return Object.assign({ id: record.id },
      lowerCamelAttributes(record.attributes)
    );
  }

  return {
    lowerCamelAttributes,
    kebabAttributes,
    unmapRecords,
    unmapRecord
  }

}

module.exports = JsonapiUtils;

/***/ }),

/***/ 130:
/***/ (function(module, exports) {

TokenCheckInterceptor.$inject = ['$q', '$location'];

function TokenCheckInterceptor($q, $location) {
    var responseInterceptor = {
        responseError: function(rejection) {
            if(typeof rejection.data === 'string' && rejection.data.includes('Token expired by')) {
                $location.path('/signin');
            }
            return rejection;
        }
    };

    return responseInterceptor;
}

module.exports = TokenCheckInterceptor;

/***/ }),

/***/ 131:
/***/ (function(module, exports) {

/*----------------------------------------
 | Lang related stuff
 *----------------------------------------
 |
 */
TranslationService.$inject = ['$rootScope', '$translate'];

function TranslationService($rootScope, $translate) {

  return {
    init: function() {

      // Get preferred language is set, and tell $translate to use it
      var preferredLang = localStorage.getItem('preferred_lang');
      if(preferredLang) {
        $translate.use(preferredLang);
      }

      // Set preferred language and configure $translate,
      // so that language pref is remembered on page reload
      $rootScope.changeLanguage = function (key) {
        localStorage.setItem('preferred_lang', key);
        $translate.use(key);
      };
    }
  }

}

module.exports = TranslationService;

/***/ }),

/***/ 132:
/***/ (function(module, exports) {

/**
 * You first need to create a formatting function to pad numbers to two digits…
 **/
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}

function formatTimer( seconds ) {
  const minutes = Math.floor( seconds / 60 );
  seconds = seconds % 60;
  return twoDigits( minutes ) + ':' + twoDigits( seconds );
}

module.exports = function() {
  return formatTimer;
};

/***/ }),

/***/ 133:
/***/ (function(module, exports) {

/*
 * @license
 * angular-socket-io v0.7.0
 * (c) 2014 Brian Ford http://briantford.com
 * License: MIT
 */

angular.module('btford.socket-io', []).
  provider('socketFactory', function () {

    'use strict';

    // when forwarding events, prefix the event name
    var defaultPrefix = 'socket:',
      ioSocket;

    // expose to provider
    this.$get = ['$rootScope', '$timeout', function ($rootScope, $timeout) {

      var asyncAngularify = function (socket, callback) {
        return callback ? function () {
          var args = arguments;
          $timeout(function () {
            callback.apply(socket, args);
          }, 0);
        } : angular.noop;
      };

      return function socketFactory (options) {
        options = options || {};
        var socket = options.ioSocket || io.connect();
        var prefix = options.prefix === undefined ? defaultPrefix : options.prefix ;
        var defaultScope = options.scope || $rootScope;

        var addListener = function (eventName, callback) {
          socket.on(eventName, callback.__ng = asyncAngularify(socket, callback));
        };

        var addOnceListener = function (eventName, callback) {
          socket.once(eventName, callback.__ng = asyncAngularify(socket, callback));
        };

        var wrappedSocket = {
          on: addListener,
          addListener: addListener,
          once: addOnceListener,

          emit: function (eventName, data, callback) {
            var lastIndex = arguments.length - 1;
            var callback = arguments[lastIndex];
            if(typeof callback == 'function') {
              callback = asyncAngularify(socket, callback);
              arguments[lastIndex] = callback;
            }
            return socket.emit.apply(socket, arguments);
          },

          removeListener: function (ev, fn) {
            if (fn && fn.__ng) {
              arguments[1] = fn.__ng;
            }
            return socket.removeListener.apply(socket, arguments);
          },

          removeAllListeners: function() {
            return socket.removeAllListeners.apply(socket, arguments);
          },

          disconnect: function (close) {
            return socket.disconnect(close);
          },

          connect: function() {
            return socket.connect();
          },

          // when socket.on('someEvent', fn (data) { ... }),
          // call scope.$broadcast('someEvent', data)
          forward: function (events, scope) {
            if (events instanceof Array === false) {
              events = [events];
            }
            if (!scope) {
              scope = defaultScope;
            }
            events.forEach(function (eventName) {
              var prefixedEvent = prefix + eventName;
              var forwardBroadcast = asyncAngularify(socket, function () {
                Array.prototype.unshift.call(arguments, prefixedEvent);
                scope.$broadcast.apply(scope, arguments);
              });
              scope.$on('$destroy', function () {
                socket.removeListener(eventName, forwardBroadcast);
              });
              socket.on(eventName, forwardBroadcast);
            });
          }
        };

        return wrappedSocket;
      };
    }];
  });

/***/ }),

/***/ 142:
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(133);


const DURATION_POMO = 1500;


/**
 * …and then create the method to output the date string as desired.
 * Some people hate using prototypes this way, but if you are going
 * to apply this to more than one Date object, having it as a prototype
 * makes sense.
 **/

function lowerCamelAttributes(attributes) {
  var newAttrs = {};
  for(var a in attributes) {
    var lowerCamelAttrKey = a.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
    newAttrs[lowerCamelAttrKey] = attributes[a];
  }
  return newAttrs;
}

function mapAttributes( item ) {
  return Object.assign( {}, { id: item.id }, lowerCamelAttributes(item.attributes) );
}



// http://0xfe.blogspot.fr/2010/04/desktop-notifications-with-webkit.html
function Notifier() {}

// Returns "true" if this browser supports notifications.
document.addEventListener('DOMContentLoaded', function () {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

// http://stackoverflow.com/questions/2271156/chrome-desktop-notification-example
function notifyMe(idleTime) {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else {
    var notification = new Notification("Don't stay idle!!", {
      icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
      body: "Hey there! You've been idle for " + idleTime + ' minute(s)',
    });

    notification.onclick = function () {
      window.open("http://stackoverflow.com/a/13328397/1269037");      
    };

  }

}

// Declare app
var app = angular.module("myApp", [
  'ngRoute',
  'ngLodash',
  'ngSanitize',
  'angularMoment',
  'markdown',
  'nvd3',
  'angular-jwt',
  'btford.socket-io',
  'pascalprecht.translate'
]);
// app.config(['$locationProvider', function($locationProvider) {
//   $locationProvider.hashPrefix('');
// }]);
app.directive('templateComment', function () {
    return {
        restrict: 'E',
        compile: function (tElement, attrs) {
            tElement.remove();
        }
    };
});
// angular.module('markdown')
// .config(function(markdownProvider) {
//   markdownProvider.config({
//     extensions: ['table']
//   });
// });
// angular.module('myApp', ['nvd3'])
app
.config(__webpack_require__(118))
.config(__webpack_require__(119))
.config(__webpack_require__(120))
.factory('authService', __webpack_require__(128))
.factory('translationService', __webpack_require__(131))
.factory('jsonapiUtils', __webpack_require__(129))
.factory('tokenCheckInterceptor', __webpack_require__(130))
.config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('tokenCheckInterceptor');
}])
.controller('mainCtrl', __webpack_require__(122))
.controller('dashboardCtrl', __webpack_require__(121))
.controller('signinCtrl', __webpack_require__(124))
.controller('signupCtrl', __webpack_require__(125))
.controller('statsCtrl', __webpack_require__(126));

app.filter('formatTimer', __webpack_require__(132));

app.run(['translationService', 'authService',
  function(translationService, authService) {
    translationService.init();
    authService.init();
  }
]);
app.run(function ($http, optionService) {
  $http.get('/api/v1/options').then(function (data) {
    let options = {};
    data.data.data.forEach(model => {
      const { key, value } = model.attributes;
      if( key.endsWith('Duration')) {
        options[key.replace('Duration', '')] = value;
      }
    });

    optionService.setData(options);
  });
});
app.service('optionService', function() {
  var myData = null;
  return {
    setData: function (data) {
      myData = data;
    },
    get: function (key) {
      return myData[key];
    }
  };
});
app.service('dataStoreService', ['$http', '$q', function($http, $q) {
  return {
    get: function(keys) {
      if(typeof keys === 'string') {
        keys = [keys];
      }
      var promises = keys.map(
        key => $http.get('/api/v1/' + key)
          .then(response => (response.data.data))
      );
      return $q.all(promises)
      .then(results => results.reduce(
        (dataSet, dataItems, index) => {
          dataSet[keys[index]] = dataItems.map(mapAttributes);
          return dataSet;
        }, {}
      ));
    }
  };
}]);
app.service('notificationService', function() {

  console.log('init notificationService');

  var socket = io();
  socket.on('idle', function(idleTime){
    console.log(idleTime);
    notifyMe(idleTime);
  });
  socket.on('server ready', function(msg){
    console.log(msg);
  });
});


// Projects controller
app.controller("projectsCtrl", __webpack_require__(123));

// Timer controller
app.controller("timerCtrl", __webpack_require__(127));




/***/ })

},[142]);