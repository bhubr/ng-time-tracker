TimerSetupController.$inject = ['lodash', 'dataService'];

function TimerSetupController(_, dataService) {
  console.log('TimerSetupController init', this);
  const self = this;

  this.filters = {
    projectId: '',
    issueId: ''
  };
  this.issueOptions = [];
  
  this.selectProject = function() {
    console.log('TimerSetupController.selectProject', this.filters);
    const id = this.filters.projectId;
    if(id !== 0) {
      const project = _.find(this.projectOptions,{ id })
      this.syncProjectIssues(project);
    }
  }


  this.syncProjectIssues = function(project) {
    console.log('TimerSetupController.syncProjectIssues', project);
    dataService.syncProjectIssues(project)
    .then(issues => {
      self.issueOptions = [{ id: 0, name: '' }].concat(issues);
      console.log('TimerSetupController $scope.issueOptions', self.issueOptions);
    })
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