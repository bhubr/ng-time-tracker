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

  $http.get('/api/v1/projects/' + projectId)
  .then(res => {
    $scope.project = jsonapiUtils.unmapRecord(res.data.data);
    console.log("got project", res, $scope.project);
  })

  $scope.loadIssues = function() {
    console.log('loadIssues');
    $http.get('/api/v1/issues?projectId=' + projectId)
    .then(res => {
      const allIssues = jsonapiUtils.unmapRecords(res.data.data);
      $scope.issues = _.filter(allIssues, issue => (issue.projectId === projectId));
      console.log("got issues", allIssues, $scope.issues);
    })
  }
  $scope.loadIssues();

}

module.exports = ProjectDetailsController;