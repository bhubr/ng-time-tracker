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
.factory('authService', require('./factories/AuthService'))
.factory('jsonapiUtils', require('./factories/JsonapiUtils'))
.controller('signinCtrl', require('./controllers/SigninController'))
.controller('signupCtrl', require('./controllers/SignupController'))
.controller('statsCtrl', require('./controllers/StatsController'));

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
app.controller("projectsCtrl", require('./controllers/ProjectsController'));

// Timer controller
app.controller("timerCtrl", require('./controllers/TimersController'));


