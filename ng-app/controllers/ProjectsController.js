ProjectsController.$inject = ['$scope', '$http', 'lodash', 'flatUiColors', 'jsonapiUtils'];

 function ProjectsController($scope, $http, lodash, flatUiColors, jsonapiUtils) {

  $scope.projects = [];
  $scope.name = '';
  $scope.description = '';
  $scope.colors = flatUiColors;
  console.log($scope.colors);
  $scope.color = '#fff';

  $scope.createProject = function() {
    const { name, description, color } = $scope;
    $scope.name = '';
    $scope.description = '';
    
    $http.post("/api/v1/projects",
    { data: { attributes: { name, description, color } } } )
    .then(function(response) {
      const newProject = mapAttributes( response.data.data );
      $scope.projects.push( newProject );
    })
    .catch(err => {
      $scope.statustext = err;
    });
  }

  $scope.pickColor = function( evt ) {
    $scope.color = $( evt.target ).data( 'color' );
  }

  // Get existing projects
  $http.get("/api/v1/projects")
  .then(function(response) {
    // $scope.projects = response.data.data.map( mapAttributes );
    $scope.projects = jsonapiUtils.unmapRecords(response.data.data);
  })
  .catch(err => {
    $scope.statustext = err;
  } );

}

module.exports = ProjectsController;