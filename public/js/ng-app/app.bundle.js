webpackJsonp([0],[
/* 0 */
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
/* 1 */
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
/* 2 */
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
/* 3 */
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
/* 4 */
/***/ (function(module, exports) {

TimersController.$inject = ['$scope', '$http', 'lodash', 'optionService', 'notificationService'];


function getTimersAndProjects( $scope, $http, lodash, optionService ) {
  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    $scope.projects = response.data.data.map( mapAttributes );
  })
  .then( () => $http.get("/api/v1/timers") )
  .then(function(response) {
    $scope.timers = response.data.data.map( mapAttributes );
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

function TimersController($scope, $http, lodash, optionService, notificationService) {
  // const DURATION_POMO = 5;
  // const IDLE = 0;
  // const RUNNING = 1;
  // $scope.timerStatus = IDLE;
  console.log('timerCtrl', optionService.get('pomodoro'));
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

    $http.post("/api/v1/timers",
    { data: { attributes: { type } } } )
    .then(function(response) {
      $scope.currentTimer = mapAttributes( response.data.data );
      $scope.timers.push( $scope.currentTimer );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  $scope.updatePomodoro = function() {

    $http.put("/api/v1/timers/" + $scope.currentTimer.id,
    { data: { attributes: {
      summary: $scope.currentTimer.summary,
      markdown: $scope.currentTimer.markdown,
      projectId: $scope.currentTimer.projectId
     } } } )
    .then(function(response) {
      $scope.currentTimer = Object.assign( 
        $scope.currentTimer,
        mapAttributes( response.data.data )
      );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  getTimersAndProjects( $scope, $http, lodash, optionService );

}
module.exports = TimersController;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

AuthService.$inject = ['$http'];

function AuthService($http) {

  function getToken() {
    return localStorage.getItem('id_token');
  }

  function setToken(jwt) {
    return localStorage.setItem('id_token', jwt);
  }

  return {
    setToken,

    getToken,

    signup: function(attributes) {
      return $http.post('/api/v1/users', { data:
       { type: "users", attributes } 
     })
      .then(function(response) {
        // var token = response.data.token;
        // self.user = jwtHelper.decodeToken(token);
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
        self.user = user;
        console.log(self);
      });
      //   return { token: token, user: self.user };
      // });
    }
  };
}

module.exports = AuthService;


/***/ }),
/* 6 */
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
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

const MYSQL_OFFSET = 7200;
const DURATION_POMO = 1500;

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

function formatTimer( seconds ) {
  const minutes = Math.floor( seconds / 60 );
  seconds = seconds % 60;
  return twoDigits( minutes ) + ':' + twoDigits( seconds );
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
var app = angular.module("myApp", ["ngRoute", 'ngLodash', 'ngSanitize', 'markdown', 'nvd3', 'angular-jwt']);
app.config(['$locationProvider', function($locationProvider) {
  $locationProvider.hashPrefix('');
}]);
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
.config(function Config($httpProvider, jwtOptionsProvider) {
  // Please note we're annotating the function so that the $injector works when the file is minified
  jwtOptionsProvider.config({
    tokenGetter: ['authService', function(authService) {
      return authService.getToken();
    }]
  });

  $httpProvider.interceptors.push('jwtInterceptor');
})
.factory('authService', __webpack_require__(5))
.factory('jsonapiUtils', __webpack_require__(6))
.controller('signinCtrl', __webpack_require__(1))
.controller('signupCtrl', __webpack_require__(2))
.controller('statsCtrl', __webpack_require__(3));

app.filter('formatTimer', function() {
  return formatTimer;
});

// Routing
app.config(function($routeProvider, $httpProvider) {
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
        controller : "timerCtrl"
    })
    .when("/stats", {
        templateUrl : "stats.html",
        controller : "statsCtrl"
    });
});

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
app.controller("projectsCtrl", __webpack_require__(0));

// Timer controller
app.controller("timerCtrl", __webpack_require__(4));




/***/ })
],[14]);