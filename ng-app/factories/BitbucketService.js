BitbucketService.$inject = ['$rootScope', '$location', '$http'];

function BitbucketService($rootScope, $location, $http) {
  var apiUrl = 'https://api.bitbucket.org/2.0';
  var service = {
    login: function () {
      var client_id = $rootScope.providers.bitbucket;
      console.log('BitbucketService', client_id);
      console.log('login');
      var bbPopup = window.open("https://bitbucket.org/site/oauth2/authorize/?client_id=" + client_id +
          // "&redirect_uri=" + encodeURI($location.protocol() + '://' + $location.host() + '/cb/bitbucket/') +
          "&response_type=token", "bbPopup");
    },

    getRepos: function() {
      const accessToken = localStorage.getItem('bb_at');
      console.log('Bearer ' + accessToken);
      return $http({
        method: 'GET',
        url: apiUrl + '/repositories/bhubr',
        skipAuthorization: true,
        // headers: {
        //   Authorization: 'Bearer ' + accessToken
        // }
      });
    }
  };
  return service;
}

module.exports = BitbucketService;