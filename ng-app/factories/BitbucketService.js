BitbucketService.$inject = ['$rootScope', '$window', '$http', 'repoApis'];

function BitbucketService($rootScope, $window, $http, repoApis) {
  var apiUrl = 'https://api.bitbucket.org/2.0';
  var service = {
    login: function () {
      var client_id = $rootScope.providers.bitbucket;
      console.log('BitbucketService', client_id);
      console.log('login');
      var url = "https://bitbucket.org/site/oauth2/authorize/?client_id=" + client_id +
        "&response_type=code";
      // var bbPopup = window.open(url, "bbPopup");
      $window.location.href = url;
      // repoApis.getUsername();
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