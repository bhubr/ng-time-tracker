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