TimerSetupController.$inject = [];

function TimerSetupController() {
  this.filters = {
    project: '',
    issue: ''
  };
  
  this.selectProject = function() {
    console.log('TimerSetupController.selectProject', this.filters);
  }

  this.selectIssue = function() {
    console.log('TimerSetupController.selectIssue', this.filters);
  }
}


module.exports = {
  templateUrl: 'timer-setup.html',
  controller: TimerSetupController,
  bindings: {
    projectOptions: '=',
    // onProjectDeleted: '&'
  }
};