TimerSetupController.$inject = [];

function TimerSetupController() {
  console.log('TimerSetupController init', this);
  this.filters = {
    project: '',
    issue: ''
  };
  
  this.selectProject = function() {
    console.log('TimerSetupController.selectProject', this.filters);
    // this.onProjectSelected({ projectId: this.filters.project });
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
    onProjectSelected: '&'
    // onProjectDeleted: '&'
  }
};