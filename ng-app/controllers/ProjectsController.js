ProjectsController.$inject = ['$scope', '$rootScope', '$window', '$http', 'lodash', 'jsonapiUtils', 'notificationService', 'flatUiColors', 'data'];

 function ProjectsController($scope, $rootScope, $window, $http, _, jsonapiUtils, notificationService, flatUiColors, data) {


  /*-------------------*
   | Private variables
   *-------------------*
   |
   */
  var blankProject = {
    name: '',
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
  $scope.project = angular.copy(blankProject);
  $scope.colors = flatUiColors;
  $scope.remoteProjects = data['remote-projects'];

  /*-------------------*
   | CRUD
   *-------------------*
   |
   */

  /**
   * Create a project
   */
  $scope.createProject = function() {
    const { name, description, color, remoteProjectId } = $scope.project;
    $scope.newProject();
    
    $http.post("/api/v1/projects",
    { data: { type: 'projects',
      attributes: { name, description, color },
      relationships: {
        owner: { data: { type: 'users', id: $rootScope.currentUser.userId } },
        'remote-project': { data: { type: 'remote-projects', id: remoteProjectId } }
      }
    } } )
    .then(function(response) {
      const newRecord = jsonapiUtils.unmapRecord( response.data.data );
      $scope.projects.push( newRecord );
      notificationService.notify('success', 'Project created');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be created: ' + err);
    });
  }

  /**
   * Update a project
   */
  $scope.updateProject = function(id) {
    const { name, description, color, remoteProjectId } = $scope.project;
    // console.log('updateProject', name, description, color, remoteProjectId, { data: { type: 'projects', id,
    //   attributes: { name, description, color } },
    //   relationships: {
    //     'remote-project': { data: { type: 'remote-projects', id: remoteProjectId } }
    //   }
    // });
    $http.put("/api/v1/projects/" + id,
    { data:
      {
        type: 'projects', id,
        attributes: { name, description, color },
        relationships: {
          'remote-project': { data: { type: 'remote-projects', id: remoteProjectId } }
        }
      }
    } )
    .then(function(response) {
      const existingProject = _.find($scope.projects, { id });
      const indexInProjects = $scope.projects.indexOf(existingProject);
      const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
      $scope.projects[indexInProjects] = updatedProject;
      notificationService.notify('success', 'Project updated');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be updated: ' + err);
    });
  }

  /**
   * Delete a project
   */
  $scope.deleteProject = function( project ) {
    if($window.confirm('Are you sure you want to delete "' + project.name + '"?')) {
      $http.delete('/api/v1/projects/' + project.id)
      .then(function(response) {
        _.remove($scope.projects, project);
        notificationService.notify('success', 'Project deleted');
      })
      .catch(err => {
        notificationService.notify('danger', 'Project could not be deleted: ' + err);
      });
    }
  }


  /*-------------------*
   | Misc
   *-------------------*
   |
   */

  /**
   * Assign a color to project
   */
  $scope.pickColor = function( evt ) {
    $scope.project.color = $( evt.target ).data( 'color' );
  }

  /**
   * Select project in list
   */
  $scope.selectProject = function( id ) {
    const project = _.find($scope.projects, { id });
    console.log('select project', id, project);
    $scope.project = angular.copy(project);
  }

  /**
   * Reset project
   */
  $scope.newProject = function() {
    $scope.project = angular.copy(blankProject);
  }

}

module.exports = ProjectsController;