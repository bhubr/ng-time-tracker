const notifier = require('node-notifier');

var io;
var socket;
function setIo(_io) {
  io = _io;

  io.on('connection', function(_socket){
    console.log('a user connected');
    socket = _socket;
    socket.emit('server ready', { msg: 'ready' });
    startIdleTimer();
  });

}

var idleTimer = {
  interval: null,
  running: 0
};

function startIdleTimer() {
  idleTimer.interval = setInterval( () => {
    idleTimer.running += 1;
    if( idleTimer.running % 120 === 0 ) {
      console.log('idle', idleTimer.running);
      // socket.emit('idle', '' + idleTimer.running / 60);
      notifier.notify('Idle for ' + idleTimer.running / 60 + ' minute(s)');
    }
  }, 1000 );
}

function stopIdleTimer() {
  clearInterval(idleTimer.interval);
  idleTimer.interval = null;
}


module.exports = { setIo, startIdleTimer, stopIdleTimer, idleTimer };