AccountsController.$inject = ['$rootScope', '$scope', '$http', '$location', '$routeParams', 'lodash', 'bitbucketService', 'repoApis', 'data'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function AccountsController($rootScope, $scope, $http, $location, $routeParams, _, bitbucketService, repoApis, data) {
  $rootScope.providers = {};
  _.each(data['client-ids'], entry => {
    $rootScope.providers[entry.provider] = entry.clientId;
  });
  // console.log($rootScope.providers);

  if($routeParams.provider) {
    var afterHash = $location.hash();
    // var splitPerAmps = afterHash.split('&');
    // var params = {};
    // _.each(splitPerAmps, kv => {
    //   const bits = kv.split('=');
    //   const key = bits.shift();
    //   const value = bits.join('=');
    //   params[key] = decodeURI(value);
    // });
    var params = $location.search();
    console.log(params);
    $http({
      method: 'POST',
      url: '/api/v1/got/' + $routeParams.provider,
      data: { code: params.code }
    })
    .then(res => {
      console.log('Server returned', res.data);
    })
    // $scope.code = params.code;
    // localStorage.setItem('bb_at', params.access_token);
    // requestStrategy.setAuthToken(params.access_token);
    // repoApis.setAuthToken('bitbucket', params.access_token);

  }

  $scope.requestAuth = function() {
    bitbucketService.login();
  }
}

module.exports = AccountsController;