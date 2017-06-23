ProjectDetailsController.$inject = ['$scope', '$rootScope', '$window', '$http', '$routeParams', 'lodash', 'jsonapiUtils', 'notificationService', 'flatUiColors'];

 function ProjectDetailsController($scope, $rootScope, $window, $http, $routeParams, _, jsonapiUtils, notificationService, flatUiColors) {

  /*-------------------*
   | Scope variables
   *-------------------*
   |
   */
  $scope.colors = flatUiColors;

  console.log('ProjectDetailsController params', $routeParams);
  const projectId = $routeParams.projectId;
  $http.get('/api/v1/projects/' + projectId)
  .then(res => {
    console.log("got project", res);
    $scope.project = jsonapiUtils.unmapRecord(res.data);
  })

}

module.exports = ProjectDetailsController;