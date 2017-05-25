ReposController.$inject = ['$rootScope', '$scope', '$location', '$routeParams', 'lodash', 'bitbucketService', 'data'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function ReposController($rootScope, $scope, $location, $routeParams, _, bitbucketService, data) {
  console.log(data.data.values);
  $scope.repos = data.data.values;
}

module.exports = ReposController;