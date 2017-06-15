require("./vendor/socket.js");

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
  'pascalprecht.translate',
  'ngCodeRepoApis'
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
.config(require('./config/JwtConfig'))
.config(require('./config/RouterConfig'))
.config(require('./config/TranslationConfig'))
.component('projectList', require('./components/ProjectListComponent'))
.component('projectEditor', require('./components/ProjectEditorComponent'))
.factory('notificationService', require('./factories/NotificationService'))
.factory('authService', require('./factories/AuthService'))
.factory('dataService', require('./factories/DataService'))
.factory('optionService', require('./factories/OptionService'))
.factory('translationService', require('./factories/TranslationService'))
.factory('jsonapiUtils', require('./factories/JsonapiUtils'))
.factory('tokenCheckInterceptor', require('./factories/TokenCheckInterceptor'))
.factory('bitbucketService', require('./factories/BitbucketService'))
.config(['$httpProvider', function($httpProvider) {  
    $httpProvider.interceptors.push('tokenCheckInterceptor');
}])
.controller('mainCtrl', require('./controllers/MainController'))
.controller('alertCtrl', require('./controllers/AlertController'))
.controller('dashboardCtrl', require('./controllers/DashboardController'))
.controller('signinCtrl', require('./controllers/SigninController'))
.controller('signupCtrl', require('./controllers/SignupController'))
.controller('accountsCtrl', require('./controllers/AccountsController'))
.controller('statsCtrl', require('./controllers/StatsController'))
.controller('projectsCtrl', require('./controllers/ProjectsController'))
.controller('timerCtrl', require('./controllers/TimersController'))
.controller('reposCtrl', require('./controllers/ReposController'))
.filter('formatTimer', require('./filters/formatTimer'))
.run(['translationService', 'authService', 'notificationService',
  function(translationService, authService, notificationService) {
    translationService.init();
    authService.init();
    notificationService.init();
  }
])

