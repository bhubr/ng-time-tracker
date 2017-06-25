TimerSetupController.$inject = [];

function TimerSetupController() {
  this.filters = {
    project: ''
  };
  console.log(this);
}


module.exports = {
  templateUrl: 'timer-setup.html',
  controller: TimerSetupController,
  bindings: {
    projectOptions: '=',
    // onProjectDeleted: '&'
  }
};