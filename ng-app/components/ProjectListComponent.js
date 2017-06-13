ProjectListController.$inject = ['lodash']; // '$scope', '$rootScope', '$window', '$http', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

function ProjectListController(_) { //$scope, $rootScope, $window, $http, , jsonapiUtils, notificationService, flatUiColors, data) {
  var ctrl = this;
  if(this.projects.length > 0) {
    this.project = this.projects[0];
  }
  console.log("ProjectListController", this.projects, 'has projects?', this.projects.length > 0, this.project);

  /**
   * Select project in list
   */
  this.selectProject = function( id ) {
    const project = _.find(this.projects, { id });
    console.log('select project', id, project);
    ctrl.project = angular.copy(project);
    // ctrl.onSelect(angular.copy(project));
  };

  this.updateProjectInList = function(updatedProject) {
    console.log('updateProject in list', updatedProject);
    const existingProject = _.find(ctrl.projects, { id: updatedProject.id });
    const indexInProjects = ctrl.projects.indexOf(existingProject);
    ctrl.projects[indexInProjects] = updatedProject;
  };

  this.deleteProjectFromList = function(deletedProject) {
    console.log('deleteProjectFromList', deletedProject);
    _.remove(ctrl.projects, deletedProject);
  };

}


module.exports = {
  templateUrl: 'project-list.html',
  controller: ProjectListController,
  bindings: {
    projects: '=',
    remoteProjects: '=',
    colors: '=',
    onSelect: '&'
    // onDelete: '&',
    // onUpdate: '&'
  }
};