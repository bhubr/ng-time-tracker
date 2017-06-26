TimerSetupController.$inject = ['lodash', 'dataService', 'optionService'];

function TimerSetupController(_, dataService, optionService) {
  console.log('TimerSetupController init', this);
  const self = this;
  const storedProjectId = localStorage.getItem('storedProjectId');
  const storedIssueId = localStorage.getItem('storedIssueId');

  this.timer = {
    id: 0,
    summary: '',
    markdown: '',
    status: '',
    ownerId: '',
    duration: optionService.get('pomodoro'),
    projectId: storedProjectId !== null ? storedProjectId : 0,
    issueId: storedIssueId !== null ? storedIssueId : 0
  };
  this.statusOptions = ['new', 'done', 'interrupted'];
  this.issueOptions = [];
  this.timer = null;
  this.timeRemaining = 0;
  this.lastTimer = {};
  this.currentTimer = {};
  this.allTimers = [];
  this.timers = [];

  this.selectProject = function() {
    console.log('TimerSetupController.selectProject', this.filters);
    const id = this.filters.projectId;
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
    console.log('TimerSetupController.selectIssue', this.filters);
    const id = this.filters.issueId;
    localStorage.setItem('storedIssueId', id);
  }


  this.startTimer = function( duration ) {
    this.timeRemaining = duration === undefined ? optionService.get('pomodoro') : duration;
    this.timer = setInterval( () => {
      this.$apply(function(){
        this.timeRemaining -= 1;
        if( this.timeRemaining === 0 ) {
          clearInterval( this.timer );
          this.timer = null;
        }
      });
    }, 1000 );

  }

  this.startPomodoro = function() {
    console.log("startPomodoro", this.currentUser, this.timer)
    const type = "pomodoro";
    this.currentTimer = null;
    this.startTimer();
    // console.log('before createPomodoro', this.currentUser, this.currentUser.id);

    $http.post("/api/v1/timers",
    {
      data: {
        type: 'timers',
        attributes: { type },
        relationships: {
          owner: { data: { type: 'users', id: $rootScope.currentUser.userId } }
        }
      }
    } )
    .then(function(response) {
      this.currentTimer = jsonapiUtils.unmapRecords(response.data.data);
      this.timers.push( this.currentTimer );
    })
    .catch(err => {
      this.statustext = err;
    });
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
  }}


module.exports = {
  templateUrl: 'timer-setup.html',
  controller: TimerSetupController,
  bindings: {
    projectOptions: '=',
    onProjectSelected: '&'
    // onProjectDeleted: '&'
  }
};