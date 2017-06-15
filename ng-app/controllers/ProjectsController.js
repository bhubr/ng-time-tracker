ProjectsController.$inject = ['$scope', '$rootScope', '$window', '$http', 'lodash', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

 function ProjectsController($scope, $rootScope, $window, $http, _, jsonapiUtils, notificationService, flatUiColors, data) {


  /*-------------------*
   | Private variables
   *-------------------*
   |
   */
  var blankProject = {
    name: 'New project',
    description: '',
    color: '#fff'
  };


  /*-------------------*
   | Scope variables
   *-------------------*
   |
   */
console.log('ProjectsController', data);
  $scope.projects = data.projects;
  // $scope.project = angular.copy(blankProject);
  $scope.colors = flatUiColors;
  $scope.remoteProjects = data['remote-projects'];

  /*-------------------*
   | CRUD
   *-------------------*
   |
   */

  $scope.onCreate = function(proj) {
    console.log('onCreate bubbled', proj);
  }


  /*-------------------*
   | Misc
   *-------------------*
   |
   */

  /**
   * Reset project
   */
  $scope.newProject = function() {
    $scope.project = angular.copy(blankProject);
  }

}

module.exports = ProjectsController;