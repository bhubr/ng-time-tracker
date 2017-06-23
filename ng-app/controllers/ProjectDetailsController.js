ProjectDetailsController.$inject = ['$scope', '$rootScope', '$window', '$http', '$routeParams', 'lodash', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

 function ProjectDetailsController($scope, $rootScope, $window, $http, $routeParams, _, jsonapiUtils, notificationService, flatUiColors, data) {

  /*-------------------*
   | Scope variables
   *-------------------*
   |
   */
  console.log('ProjectDetailsController params', $routeParams);
  const projectId = $routeParams.projectId;
  $scope.colors = flatUiColors;
  $scope.remoteProjects = data['remote-projects'];
  $scope.loadIssues();

  $http.get('/api/v1/projects/' + projectId)
  .then(res => {
    $scope.project = jsonapiUtils.unmapRecord(res.data.data);
    console.log("got project", res, $scope.project);
  })

  $scope.loadIssues = function() {
    console.log('loadIssues');
    $http.get('/api/v1/issues?projectId=' + projectId)
    .then(res => {
      $scope.issues = jsonapiUtils.unmapRecords(res.data.data);
      console.log("got issues", res, $scope.project);
    })
  }

}

module.exports = ProjectDetailsController;