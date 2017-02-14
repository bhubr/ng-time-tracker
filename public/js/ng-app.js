const MYSQL_OFFSET = 3600;
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
const flatUiColors = [
  {
    "color": "#1abc9c",
    "name": "TURQUOISE"
  }, {
    "color": "#2ecc71",
    "name": "EMERALD"
  }, {
    "color": "#3498db",
    "name": "PETER RIVER"
  }, {
    "color": "#9b59b6",
    "name": "AMETHYST"
  }, {
    "color": "#34495e",
    "name": "WET ASPHALT"
  }, {
    "color": "#16a085",
    "name": "GREEN SEA"
  }, {
    "color": "#27ae60",
    "name": "NEPHRITIS"
  }, {
    "color": "#2980b9",
    "name": "BELIZE HOLE"
  }, {
    "color": "#8e44ad",
    "name": "WISTERIA"
  }, {
    "color": "#2c3e50",
    "name": "MIDNIGHT BLUE"
  }, {
    "color": "#f1c40f",
    "name": "SUN FLOWER"
  }, {
    "color": "#e67e22",
    "name": "CARROT"
  }, {
    "color": "#e74c3c",
    "name": "ALIZARIN"
  }, {
    "color": "#ecf0f1",
    "name": "CLOUDS"
  }, {
    "color": "#95a5a6",
    "name": "CONCRETE"
  }, {
    "color": "#f39c12",
    "name": "ORANGE"
  }, {
    "color": "#d35400",
    "name": "PUMPKIN"
  }, {
    "color": "#c0392b",
    "name": "POMEGRANATE"
  }, {
    "color": "#bdc3c7",
    "name": "SILVER"
  }, {
    "color": "#7f8c8d",
    "name": "ASBESTOS"
  }
];
function mapAttributes( item ) {
  return Object.assign( {}, { id: item.id }, item.attributes );
}

function formatTimer( seconds ) {
  const minutes = Math.floor( seconds / 60 );
  seconds = seconds % 60;
  return twoDigits( minutes ) + ':' + twoDigits( seconds );
}

// Declare app
var app = angular.module("myApp", ["ngRoute", 'ngLodash', 'nvd3']);

// angular.module('myApp', ['nvd3'])
// .controller('statsCtrl', function($scope){
//    $scope.options = { /* JSON data */ };
//    $scope.data = { /* JSON data */ }
//    $scope.title = 'Daily stats';
// })

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
    // .when("/stats", {
    //     templateUrl : "stats.html",
    //     controller : "statsCtrl"
    // });
});


// Stats controller
// app.controller("statsCtrl", function ($scope, $http, lodash, nvd3) {
//   $scope.title = 'Daily stats';
// });


// Projects controller
app.controller("projectsCtrl", function ($scope, $http, lodash) {

  $scope.projects = [];
  $scope.name = ''; // chance.word();
  $scope.description = ''; // chance.sentence();
  $scope.colors = flatUiColors;
  $scope.color = '#fff';

  $scope.createProject = function() {
    const { name, description, color } = $scope;
    $scope.name = chance.word();
    $scope.description = chance.sentence();
    
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
    $scope.projects = response.data.data.map( mapAttributes );
  })
  .catch(err => {
    $scope.statustext = err;
  } );

});

// Timer controller
app.controller("timerCtrl", function ($scope, $http, lodash) {
  // const DURATION_POMO = 5;
  // const IDLE = 0;
  // const RUNNING = 1;
  // $scope.timerStatus = IDLE;
  $scope.timer = null;
  $scope.timeRemaining = 0;
  $scope.lastTimer = {};
  $scope.currentTimer = {};
  $scope.timers = [];
  $scope.projects = [];
  $scope.statuses = ['new', 'done', 'interrupted'];

  $scope.startTimer = function( duration ) {
    $scope.timeRemaining = duration === undefined ? DURATION_POMO : duration;
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
    console.log( $parentLi );
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
      $scope.items.push( $scope.currentTimer );
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
      'project-id': $scope.currentTimer['project-id']
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

  getTimersAndProjects( $scope, $http, lodash );

});

function getTimersAndProjects( $scope, $http, lodash ) {
  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    $scope.projects = response.data.data.map( mapAttributes );
  })
  .then( () => $http.get("/api/v1/timers") )
  .then(function(response) {
    $scope.timers = response.data.data.map( mapAttributes );
    console.log( $scope.projects );
    $scope.timers.forEach( (timer, index, timers) => {
      if( timer['project-id'] ) {
        timers[index].project = lodash.find( $scope.projects, { id: timer['project-id'] } );
        console.log( timer.id, 'has project id', timer['project-id'], '=>', timers[index].project );
      }
    } );
    $scope.lastTimer = lodash.findLast( $scope.timers, { status: 'new' } );
    if( $scope.lastTimer !== undefined ) {
      var timeStampStart = new Date( $scope.lastTimer['created-at'] ).getTime();
      var timeStampNow = Date.now();
      var timeDiff = Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET;
      if( timeDiff < DURATION_POMO ) {
        $scope.startTimer( DURATION_POMO - timeDiff );
        $scope.currentTimer = $scope.lastTimer;
      }
    }
  })
  .catch(err => {
    $scope.statustext = err;
  } );
}

