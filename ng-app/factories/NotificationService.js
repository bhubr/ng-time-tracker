NotificationService.$inject = ['$rootScope'];

function NotificationService($rootScope) {
  
  function notify(alertClass, message) {
    $rootScope.$emit('alert', {
      alertClass, message
    });
  }

  function init() {
    console.log('init notificationService');

    var socket = io();
    socket.on('idle', function(idleTime){
      console.log(idleTime);
      notifyMe(idleTime);
    });
    socket.on('server ready', function(msg){
      console.log(msg);
    });
  }

  return {
    notify,
    init
  }
}

module.exports = NotificationService;