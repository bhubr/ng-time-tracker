MainController.$inject = ['$rootScope', '$scope', '$location', 'authService'];

function MainController($rootScope, $scope, $location, authService) {
  $scope.logout = function() {
    console.log('MainController.logout');
    authService.signout();
    $location.path('/signin');
  }
}

module.exports = MainController;