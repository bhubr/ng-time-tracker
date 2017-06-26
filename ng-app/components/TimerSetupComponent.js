TimerSetupController.$inject = ['lodash', 'dataService'];

function TimerSetupController(_, dataService) {
  console.log('TimerSetupController init', this);
  const self = this;
  const storedProjectId = localStorage.getItem('storedProjectId');
  const storedIssueId = localStorage.getItem('storedIssueId');

  this.filters = {
    projectId: storedProjectId !== null ? storedProjectId : 0,
    issueId: storedIssueId !== null ? storedIssueId : 0
  };
  this.issueOptions = [];
  
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
      console.log('TimerSetupController $scope.issueOptions', self.issueOptions);
    })
  }

  this.selectIssue = function() {
    console.log('TimerSetupController.selectIssue', this.filters);
    const id = this.filters.issueId;
    localStorage.setItem('storedIssueId', id);
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