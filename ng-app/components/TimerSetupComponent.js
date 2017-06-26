TimerSetupController.$inject = ['lodash'];

function TimerSetupController(_) {
  console.log('TimerSetupController init', this);
  this.filters = {
    projectId: '',
    issueId: ''
  };
  
  this.selectProject = function() {
    console.log('TimerSetupController.selectProject', this.filters);
    const id = this.filters.projectId;
    if(id !== 0) {
      const project = _.find(this.projectOptions,{ id })
      this.onProjectSelected({ project });
    }
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