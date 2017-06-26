TimerSetupController.$inject = ['$interval', 'lodash', 'dataService', 'optionService', 'notificationService'];

function TimerSetupController($interval, _, dataService, optionService, notificationService) {
  console.log('TimerSetupController init', this);
  const self = this;
  const MYSQL_OFFSET = 7200;
  const storedProjectId = localStorage.getItem('storedProjectId');
  const storedIssueId = localStorage.getItem('storedIssueId');

  this.timer = {
    id: 0,
    summary: '',
    markdown: '',
    status: '',
    ownerId: '',
    type: 'pomodoro',
    duration: optionService.get('pomodoro'),
    projectId: storedProjectId !== null ? storedProjectId : 0,
    issueId: storedIssueId !== null ? storedIssueId : 0
  };

  this.statusOptions = ['new', 'done', 'interrupted'];
  this.issueOptions = [];
  this.timerInterval = null;
  this.timeRemaining = 0;
  this.lastTimer = {};
  // this.currentTimer = {};
  this.allTimers = [];
  this.timers = [];

  this.selectProject = function() {
    console.log('TimerSetupController.selectProject', this.timer);
    const id = this.timer.projectId;
    if(id !== 0) {
      const project = _.find(this.projectOptions,{ id })
      this.syncProjectIssues(project);
    }
    localStorage.setItem('storedProjectId', id);
    localStorage.removeItem('storedIssueId');
  }


  this.syncProjectIssues = function(project) {
    console.log('TimerSetupController.syncProjectIssues', project);
    dataService.syncProjectIssues(project)
    .then(issues => {
      self.issueOptions = [{ id: 0, title: '' }].concat(issues);
      console.log('TimerSetupController this.issueOptions', self.issueOptions);
    })
  }

  this.selectIssue = function() {
    console.log('TimerSetupController.selectIssue', this.timer);
    const id = this.timer.issueId;
    localStorage.setItem('storedIssueId', id);
  }


  this.startTimer = function( duration ) {
    this.timeRemaining = duration === undefined ? optionService.get('pomodoro') : duration;
    this.timerInterval = $interval( () => {
      // this.$apply(function(){
        self.timeRemaining -= 1;
        if( self.timeRemaining === 0 ) {
          $interval.cancel( self.timerInterval );
          self.timerInterval = null;
        }
      // });
    }, 1000 );

  }

  this.startPomodoro = function() {
    console.log("startPomodoro", this.currentUser, this.timer)
    const type = "pomodoro";
    this.currentTimer = null;
    // console.log('before createPomodoro', this.currentUser, this.currentUser.id);
    dataService.createTimer(this.timer)
    .then(timer => {
      console.log('startPomodoro timer returned', timer);
      this.startTimer();
      this.timer = timer;
      this.timers.push( this.timer );
      notificationService.notify('success', 'timer started');
    })
    .catch(err => {
      notificationService.notify('danger', 'timer creation failed: ' + err);
    })
    // $http.post("/api/v1/timers",
    // {
    //   data: {
    //     type: 'timers',
    //     attributes: { type },
    //     relationships: {
    //       owner: { data: { type: 'users', id: $rootScope.currentUser.userId } }
    //     }
    //   }
    // } )
    // .then(function(response) {
    //   this.currentTimer = jsonapiUtils.unmapRecords(response.data.data);
    //   this.timers.push( this.currentTimer );
    // })
    // .catch(err => {
    //   this.statustext = err;
    // });
  }

  this.updatePomodoro = function() {

    $http.put("/api/v1/timers/" + this.currentTimer.id, {
      data: {
        type: 'timers',
        id: this.currentTimer.id,
        attributes: {
          summary: this.currentTimer.summary,
          markdown: this.currentTimer.markdown,
          projectId: this.currentTimer.projectId
        }
      } 
    } )
    .then(function(response) {
      this.currentTimer = Object.assign( 
        this.currentTimer,
        jsonapiUtils.unmapRecord(response.data.data)
      );
    })
    .catch(err => {
      this.statustext = err;
    });
  }

  if(this.lastTimer) {
    console.log('has lastTimer', this.lastTimer);
    var timeStampStart = new Date( this.lastTimer.createdAt ).getTime();
    var timeStampNow = Date.now();
    console.log('timer start, now, diff:', timeStampStart, timeStampNow, Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET);
    var timeDiff = Math.floor( ( timeStampNow - timeStampStart ) / 1000 ) - MYSQL_OFFSET;
    if( timeDiff < optionService.get('pomodoro') ) {
      this.startTimer( optionService.get('pomodoro') - timeDiff );
      this.timer = this.lastTimer;
    }
  }

}


module.exports = {
  templateUrl: 'timer-setup.html',
  controller: TimerSetupController,
  bindings: {
    projectOptions: '=',
    onProjectSelected: '&'
    // onProjectDeleted: '&'
  }
};