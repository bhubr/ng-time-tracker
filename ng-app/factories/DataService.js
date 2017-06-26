/*----------------------------------------
 | Data service
 *----------------------------------------
 |
 */
DataService.$inject = ['$http', '$q', 'lodash', 'jsonapiUtils'];

function DataService($http, $q, _, jsonapiUtils) {
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

      return $http.post("/api/v1/timers",
      {
        data: {
          type: 'timers',
          attributes: timer, //{ type },
          relationships: {
            owner: { data: { type: 'users', id: $rootScope.currentUser.userId } }
          }
        }
      } )
      .then(function(response) {
        // this.currentTimer = jsonapiUtils.unmapRecords(response.data.data);
        return jsonapiUtils.unmapRecords(response.data.data);
        this.timers.push( this.currentTimer );
      })
      // .catch(err => {
      //   this.statustext = err;
      // });
    }
  };
}

module.exports = DataService;