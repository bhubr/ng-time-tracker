ProjectDetailsController.$inject = ['$scope', '$rootScope', '$window', '$http', '$routeParams', 'lodash', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

 function ProjectDetailsController($scope, $rootScope, $window, $http, $routeParams, _, jsonapiUtils, notificationService, flatUiColors, data) {

  /*-------------------*
   | Scope variables
   *-------------------*
   |
   */
  $scope.colors = flatUiColors;
  $scope.remoteProjects = data['remote-projects'];

  console.log('ProjectDetailsController params', $routeParams);
  const projectId = $routeParams.projectId;
  $http.get('/api/v1/projects/' + projectId)
  .then(res => {
    $scope.project = jsonapiUtils.unmapRecord(res.data.data);
    console.log("got project", res, $scope.project);
  })

}

module.exports = ProjectDetailsController;