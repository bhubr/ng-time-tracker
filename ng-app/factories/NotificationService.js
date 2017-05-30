NotificationService.$inject = ['$rootScope'];

function NotificationService($rootScope) {
  return {
    notify: function(alertClass, message) {
      $rootScope.$emit('alert', {
        alertClass, message
      });
    }
  }
}

module.exports = NotificationService;