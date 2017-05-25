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