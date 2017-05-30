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
    }
  };
}

module.exports = DataService;