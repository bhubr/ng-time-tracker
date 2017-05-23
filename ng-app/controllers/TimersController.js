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