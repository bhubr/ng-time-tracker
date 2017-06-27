NotificationService.$inject = ['$rootScope'];

function NotificationService($rootScope) {

  /**
   * Send browser desktop notification.
   * Source: http://stackoverflow.com/questions/2271156/chrome-desktop-notification-example
   */
  function notifyMe(data) {
    const textsPerType = {
      idle: {
        title: "Don't stay idle!!!",
        body: data => {
          return "Hey there! You've been idle for " + data.idleTime + ' minute(s)';
        }
      },
      done: {
        title: 'Timer complete',
        body: data => {
          return "Feel free to take a break! Do it!";
        }
      }
    };
    const texts = textsPerType[data.type];
    // Request permission if not yet granted
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
    else {
      var notification = new Notification(texts.title, {
        icon: 'https://ares.gods.ovh/img/Tomato_icon-icons.com_68675.png',
        body: texts.body(data),
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
      notifyMe({ type: 'idle', idleTime: idleTime });
    });
    socket.on('server ready', function(msg){
      // console.log(msg);
      const token = localStorage.getItem('id_token');
      if(token !== null) {
        socket.emit('client ready', token);
      }
    });
    socket.on('timer done', () => {
      notifyMe({ type: 'done' })
    });
  }

  return {
    notify,
    init
  }
}

module.exports = NotificationService;