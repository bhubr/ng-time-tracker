AlertController.$inject = ['$rootScope', '$scope', '$timeout'];

// https://www.liquidint.com/blog/angularjs-and-instagram-a-single-page-application-with-oauth2/
function AlertController($rootScope, $scope, $timeout) {
  $rootScope.$on('alert', data => {
    console.log('received alert', data);
    $scope.alertClass = 'alert-' + data.alertClass;
    $scope.message = data.message;
    $timeout(() => {
      $scope.alertClass = 'hidden';
      $scope.message = '';
    }, 3000);
  });
}

module.exports = AlertController;