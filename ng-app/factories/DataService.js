/*----------------------------------------
 | Data service
 *----------------------------------------
 |
 */
DataService.$inject = ['$rootScope', '$http', '$q', 'lodash', 'jsonapiUtils'];

function DataService($rootScope, $http, $q, _, jsonapiUtils) {
  return {
    get: function(keys) {
      if(typeof keys === 'string') {
        keys = [keys];
      }
      var urlsWithQs = keys.map(key => {
        const bits = key.split('?');
        let entry = {
          url: bits[0]
        };
        if(bits.length > 1) {
          entry.qs = bits[1];
        }
        return entry;
      });
      console.log(urlsWithQs);
      var promises = urlsWithQs.map(
        entry => $http.get('/api/v1/' + entry.url + (entry.qs ? ('?' + entry.qs) : ''))
          .then(response => (response.data.data))
      );
      return $q.all(promises)
      .then(results => results.reduce(
        (dataSet, dataItems, index) => {
          dataSet[urlsWithQs[index].url] = jsonapiUtils.unmapRecords(dataItems);
          return dataSet;
        }, {}
      ));
    },

    create: function(type, attributes, rawRelationships) {
      const relationships = {};
      _.forOwn(rawRelationships, (data, key) => {
        relationships[key] = { data };
      });
      return $http.post('/api/v1/' + type, {
        data: { type, attributes, relationships }
      })
      .then(response => (response.data));
    },

    syncProjectIssues: function(project) {
      const { name, description, remoteProjectId } = project;
      return $http.post("/api/v1/sync/issues/" + remoteProjectId,
      {} )
      .then(function(response) {
        console.log("## syncIssues returned");
        console.log(response.data);
        return response.data;
        // const updatedProject = jsonapiUtils.unmapRecord( response.data.data );
        // ctrl.onProjectUpdated({ project: updatedProject });

        notificationService.notify('success', 'syncProjectIssues ok');
      })
      .catch(err => {
        notificationService.notify('danger', 'syncProjectIssues err: ' + err);
      });
    },

    createTimer: function(timer) {
      console.log('DS.createTimer ### 1', timer, $rootScope.currentUser.userId)
      const { type, summary, markdown, duration, issueId, ownerId, projectId } = timer;
      console.log('DS.createTimer ### 2', type, summary, markdown, duration, issueId, ownerId, projectId);
      const relationships = {
        owner: { data: { type: 'users', id: $rootScope.currentUser.userId } },
        project: { data: { type: 'projects', id: projectId } },
        // issue: 
      };
      if(issueId) {
        relationships.issue = { data: { type: 'issues', id: issueId } };
      }
      const data = {
        type: 'timers',
        attributes: { type, summary, markdown, duration },
        relationships
      };
      console.log('DS.createTimer ### 3', { data });
      return $http.post("/api/v1/timers", { data } )
      .then(function(response) {
        // this.currentTimer = jsonapiUtils.unmapRecords(response.data.data);
        return jsonapiUtils.unmapRecord(response.data.data);
        // this.timers.push( this.currentTimer );
      })
      // .catch(err => {
      //   this.statustext = err;
      // });
    },

    updateTimer: function(timer) {
      return $http.put("/api/v1/timers/" + timer.id, {
        data: {
          type: 'timers',
          id: timer.id,
          attributes: {
            summary: timer.summary,
            markdown: timer.markdown
          }
        } 
      } )
      .then(function(response) {
        return jsonapiUtils.unmapRecord(response.data.data);
      })
      .catch(err => {
        this.statustext = err;
      });
    }
  };
}

module.exports = DataService;