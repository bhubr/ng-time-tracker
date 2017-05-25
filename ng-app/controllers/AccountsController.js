AccountsController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', 'lodash', 'bitbucketService', 'data'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function AccountsController($rootScope, $scope, $location, $routeParams, _, bitbucketService, data) {
  $rootScope.providers = {};
  _.each(data['client-ids'], entry => {
    $rootScope.providers[entry.provider] = entry.clientId;
  });
  // console.log($rootScope.providers);

  if($routeParams.provider) {
    var afterHash = $location.hash();
    var splitPerAmps = afterHash.split('&');
    var params = {};
    _.each(splitPerAmps, kv => {
      const [key, value] = kv.split('=');
      params[key] = value;
    });
    console.log(params);
    localStorage.setItem('bb_at', params.access_token);
  }

  $scope.requestAuth = function() {
    bitbucketService.login();
  }
}

module.exports = AccountsController;