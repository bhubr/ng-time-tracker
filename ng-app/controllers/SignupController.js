SignupController.$inject = ['$rootScope', '$scope', 'authService'];

function SignupController($rootScope, $scope, authService) {
  $scope.hideFooterTimer = true;
  // $scope.payload = {
  //   email: '',
  //   username: '',
  //   firstName: '',
  //   lastName: '',
  //   password: '',
  // };

  $scope.signup = function() {
    authService.signup($scope.payload);
  }
}

module.exports = SignupController;