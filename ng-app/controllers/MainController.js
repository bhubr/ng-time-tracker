MainController.$inject = ['$rootScope', '$scope', '$location', 'authService'];

function MainController($rootScope, $scope, $location, authService) {
  $scope.logout = function() {
    authService.signout();
    $location.path('/signin');
  }
}

module.exports = MainController;