ReposController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', 'repoApis', 'lodash', 'bitbucketService', 'data'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function ReposController($rootScope, $scope, $location, $routeParams, repoApis, _, bitbucketService, data) {
  console.log('ReposController data', data);
  $scope.repos = data.values;
}

module.exports = ReposController;