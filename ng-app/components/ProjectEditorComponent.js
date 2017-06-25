ProjectEditorController.$inject = ['$rootScope', '$scope', '$http', '$window', 'lodash', 'jsonapiUtils', 'notificationService'];

function ProjectEditorController($rootScope, $scope, $http, $window, _, jsonapiUtils, notificationService) {
  const ctrl = this;
  console.log('ProjectEditorController scope', $scope)

  // this.$onChanges = function(changesObj) {
  //   console.log('$onChanges', changesObj);
  // };

  /**
   * Create a project
   */
  $scope.createProject = function(project) {
    // console.log('createProject', this, this.project);
    const { name, description, color, remoteProjectId } = project;
    // $scope.newProject();
    
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
      ctrl.onCreate(newRecord);
      // $scope.projects.push( newRecord );
      notificationService.notify('success', 'Project created');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be created: ' + err);
    });
  }

  /**
   * Update a project
   */
  this.updateProject = function(id) {
    const { name, description, color, active, remoteProjectId } = ctrl.project;
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
        attributes: { name, description, color, active },
        relationships: {
          'remote-project': { data: { type: 'remote-projects', id: remoteProjectId } }
        }
      }
    } )
    .then(function(response) {
      const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
      ctrl.onProjectUpdated({ project: updatedProject });

      notificationService.notify('success', 'Project updated');
    })
    .catch(err => {
      notificationService.notify('danger', 'Project could not be updated: ' + err);
    });
  }


  /**
   * Sync issues
   */
  this.syncIssues = function(id) {
    const { name, description, remoteProjectId } = ctrl.project;
    $http.post("/api/v1/sync/issues/" + remoteProjectId,
    {} )
    .then(function(response) {
      console.log("## syncIssues returned");
      console.log(response.data);
      // const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
      // ctrl.onProjectUpdated({ project: updatedProject });

      // notificationService.notify('success', 'Project updated');
    })
    .catch(err => {
      // notificationService.notify('danger', 'Project could not be updated: ' + err);
    });
  }


  /**
   * Delete a project
   */
  this.deleteProject = function( project ) {
    if($window.confirm('Are you sure you want to delete "' + project.name + '"?')) {
      $http.delete('/api/v1/projects/' + project.id)
      .then(function(response) {
        // _.remove(ctrl.projects, project);
        ctrl.onProjectDeleted({ project });
        notificationService.notify('success', 'Project deleted');
      })
      .catch(err => {
        notificationService.notify('danger', 'Project could not be deleted: ' + err);
      });
    }
  }
  /**
   * Assign a color to project
   */
  $scope.pickColor = function( evt ) {
    $scope.project.color = $( evt.target ).data( 'color' );
  }

}

module.exports = {
  templateUrl: 'project-editor.html',
  controller: ProjectEditorController,
  bindings: {
    project: '=',
    remoteProjects: '=',
    onCreate: '&',
    onDelete: '&',
    onUpdate: '&',
    onIssuesSynced: '&',
    onProjectUpdated: '&',
    onProjectDeleted: '&'
  }
};