TimerSetupComponent.$inject = [];

function TimerSetupComponent() {
  this.filters = {
    project: ''
  };
  console.log(this);
}


module.exports = {
  templateUrl: 'timer-setup.html',
  controller: TimerSetupComponent,
  bindings: {
    projectOptions: '=',
    // onProjectDeleted: '&'
  }
};