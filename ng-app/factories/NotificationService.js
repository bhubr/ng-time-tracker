NotificationService.$inject = ['$rootScope'];

function NotificationService($rootScope) {

  // http://stackoverflow.com/questions/2271156/chrome-desktop-notification-example
  function notifyMe(idleTime) {
    if (Notification.permission !== "granted")
      Notification.requestPermission();
    else {
      var notification = new Notification("Don't stay idle!!", {
        icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
        body: "Hey there! You've been idle for " + idleTime + ' minute(s)',
      });

      notification.onclick = function () {
        window.open("http://stackoverflow.com/a/13328397/1269037");      
      };
    }
  }
  
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