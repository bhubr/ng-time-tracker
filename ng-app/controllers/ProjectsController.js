ProjectsController.$inject = ['$scope', '$http', 'lodash', 'flatUiColors', 'jsonapiUtils', 'notificationService'];

 function ProjectsController($scope, $http, _, flatUiColors, jsonapiUtils, notificationService) {

  $scope.projects = [];
  var newProject = {
    name: '',
    description: '',
    color: '#fff'
  };
  $scope.project = angular.copy(newProject);
  $scope.colors = flatUiColors;
  console.log($scope.colors);

  $scope.createProject = function() {
    const { name, description, color } = $scope.project;
    $scope.newProject();
    
    $http.post("/api/v1/projects",
    { data: { attributes: { name, description, color } } } )
    .then(function(response) {
      const newRecord = jsonapiUtils.unmapRecord( response.data.data );
      $scope.projects.push( newRecord );
      notificationService.notify('success', 'Project created');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be created: ' + err);
    });
  }

  $scope.updateProject = function(id) {
    const { name, description, color } = $scope.project;
    $http.put("/api/v1/projects/" + id,
    { data: { type: 'projects', id, attributes: { name, description, color } } } )
    .then(function(response) {
      const existingProject = _.find($scope.projects, { id });
      const indexInProjects = $scope.projects.indexOf(existingProject);
      const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
      $scope.projects[indexInProjects] = updatedProject;
      $scope.newProject();
      notificationService.notify('success', 'Project updated');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be updated: ' + err);
    });
  }
  $scope.pickColor = function( evt ) {
    $scope.project.color = $( evt.target ).data( 'color' );
  }

  $scope.selectProject = function( id ) {
    const project = _.find($scope.projects, { id });
    console.log('select project', id, project);
    $scope.project = angular.copy(project);
  }

  $scope.newProject = function() {
    $scope.project = angular.copy(newProject);
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