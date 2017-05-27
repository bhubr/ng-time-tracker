ReposController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', 'repoApis', 'lodash', 'bitbucketService', 'data'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function ReposController($rootScope, $scope, $location, $routeParams, repoApis, _, bitbucketService, data) {
  console.log(data.data.values);
  $scope.repos = data.data.values;
  repoApis.pouet();
}

module.exports = ReposController;