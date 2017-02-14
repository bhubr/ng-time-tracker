
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
// Date.prototype.toMysqlFormat = function() {
//     return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
// };

function mapAttributes( item ) {
  return Object.assign( {}, { id: item.id }, item.attributes );
}

function formatTimer( seconds ) {
  const minutes = Math.floor( seconds / 60 );
  seconds = seconds % 60;
  return twoDigits( minutes ) + ':' + twoDigits( seconds );
}

// Declare app
var app = angular.module("myApp", ["ngRoute", 'ngLodash']);
app.filter('formatTimer', function() {
  return formatTimer;
});

// Routing
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "projects.html",
        controller : "projectsCtrl"
    })
    .when("/timer", {
        templateUrl : "timer.html",
        controller : "timerCtrl"
    });
});

// Projects controller
app.controller("projectsCtrl", function ($scope, $http, lodash) {

  $scope.projects = [];
  $scope.name = chance.word();
  $scope.description = chance.sentence();
  // $scope.myCol = '#abc';

  $scope.createProject = function() {
    const { name, description } = $scope;
    $scope.name = chance.word();
    $scope.description = chance.sentence();
    
    $http.post("/api/v1/projects",
    { data: { attributes: { name, description } } } )
    .then(function(response) {
      const newProject = mapAttributes( response.data.data );
      $scope.projects.push( newProject );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    $scope.projects = response.data.data.map( mapAttributes );
  })
  .catch(err => {
    $scope.statustext = err;
  } );

});

// Timer controller
app.controller("timerCtrl", function ($scope, $http, lodash) {
  const DURATION = 1500;
  // const DURATION = 5;
  // const IDLE = 0;
  // const RUNNING = 1;
  // $scope.timerStatus = IDLE;
  $scope.timer = null;
  $scope.timeRemaining = 0;
  $scope.currentTimer = {};
  $scope.timers = [];
  $scope.projects = [];

  $scope.startTimer = function() {
    $scope.timeRemaining = DURATION;
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
    var id = parseInt( $( evt.target ).attr( 'id' ).substr( 6 ), 10 );
    console.log( $scope.timers );
    var timer = lodash.find( $scope.timers, { id } );
    $scope.currentTimer = timer;
  }

  $scope.createPomodoro = function() {
    const type = "pomodoro";
    $scope.description = "enter description here";
    $scope.currentTimer = null;
    $scope.startTimer();

    $http.post("/api/v1/timers",
    { data: { attributes: { type } } } )
    .then(function(response) {
      $scope.currentTimer = mapAttributes( response.data.data );
      $scope.items.push( $scope.currentTimer );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  $scope.updatePomodoro = function() {

    $http.put("/api/v1/timers/" + $scope.currentTimer.id,
    { data: { attributes: { description: $scope.description } } } )
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



  // Get existing projects
  $http.get("/api/v1/timers")
  .then(function(response) {
    $scope.timers = response.data.data.map( mapAttributes );
  })
  .catch(err => {
    $scope.statustext = err;
  } );

  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    $scope.projects = response.data.data.map( mapAttributes );
  })
  .catch(err => {
    $scope.statustext = err;
  } );

});
