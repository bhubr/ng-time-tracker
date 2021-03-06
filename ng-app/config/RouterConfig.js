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
      data: ['dataService', function(dataService) {
        return dataService.get(['projects', 'options', 'timers', 'daily-posts', 'client-ids']);
      }]
    }
  })
  .when("/accounts", {
    templateUrl : "accounts.html",
    controller : "accountsCtrl",
    resolve: {
      data: ['$rootScope', '$http', '$q', 'dataService', function($rootScope, $http, $q, dataService) {
        console.log('/accounts data resolution', $rootScope.currentUser);
        return dataService.get(['client-ids', 'accounts?userId=' + $rootScope.currentUser.userId]);
        // .then(responses => ({
        //   'client-ids': responses[0]['client-ids'],
        //   accounts: responses[1].data
        // }));
      }]
    }
  })
  .when("/repos", {
    templateUrl : "repositories.html",
    controller : "reposCtrl",
    resolve: {
      data: ['bitbucketService', function(bitbucketService) {
        return bitbucketService.getRepos();
      }]
    }
  })
  .when("/cb/:provider", {
    templateUrl : "accounts.html",
    controller : "accountsCtrl",
    resolve: {
      data: ['dataService', function(dataService) {
        return dataService.get(['client-ids']);
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
      }],
      data: ['dataService', function(dataService) {
        return dataService.get(['projects', 'remote-projects']);
      }]
    }
  })
  .when("/projects/:projectId", {
    templateUrl : "project-details.html",
    controller : "projectsDetailsCtrl",
    resolve: {
      flatUiColors: ['$http', function($http) {
        return $http.get('/flat-ui-colors.json')
        .then(response => (response.data));
      }],
      data: ['dataService', function(dataService) {
        return dataService.get(['remote-projects']);
      }]
    }
  })
  .when("/timer", {
    templateUrl : "timer.html",
    controller : "timerCtrl",
    // resolve: {
    //   currentUser: ['authService', function(authService) {
    //     return authService.getCurrentUser();
    //   }]
    // }
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