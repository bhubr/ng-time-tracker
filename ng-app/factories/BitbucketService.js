BitbucketService.$inject = ['$rootScope', '$window', '$http', 'repoApis'];

function BitbucketService($rootScope, $window, $http, repoApis) {
  // var apiUrl = 'https://api.bitbucket.org/2.0';
  var authorizeUrls = {
    bitbucket: "https://bitbucket.org/site/oauth2/authorize",
    github: "https://github.com/login/oauth/authorize",
    gitlab: "https://gitlab.com/oauth/authorize"
  }
  console.log('BitbucketService providers', $rootScope.providers);
  var service = {
    authorize: function (provider) {
      var providerParams = $rootScope.providers[provider];
      console.log('provider entry', providerParams);
      var clientId = providerParams.clientId;
      var authorizeUrl = authorizeUrls[provider];
      var url = authorizeUrl + "?client_id=" + clientId + "&response_type=code" +
        (providerParams.redirectUri ? ('&redirect_uri=' + providerParams.redirectUri) : '');
      $window.location.href = url;
    },

    getRepos: function() {
      // const accessToken = localStorage.getItem('bb_at');
      console.log('BitbucketService.getRepos', repoApis);
      return repoApis.bitbucket.getProjects();
      // console.log('Bearer ' + accessToken);
      // return $http({
      //   method: 'GET',
      //   url: apiUrl + '/repositories/bhubr',
      //   // skipAuthorization: true,
      //   headers: {
      //     Authorization: 'Bearer ' + accessToken
      //   }
      // });
    }
  };
  return service;
}

module.exports = BitbucketService;