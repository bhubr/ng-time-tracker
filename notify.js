const configs = require(__dirname + '/config.json');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = configs[env];
const models = require('./models');
const { checkJwt } = require('jsonapi-express-backend')(__dirname, config, models);

// const notifier = require('node-notifier');

var io;
// var socket;
function setIo(_io) {
  io = _io;

  io.on('connection', function(socket){
    console.log('a user connected');
    // socket = _socket;
    socket.on('client ready', function(jwt) {
      console.log('received from client', jwt);
      checkJwt(jwt)
      .then(decoded => {
        console.log('decoded jwt', decoded);
      })
    });
    socket.emit('server ready', { msg: 'ready' });
  });

}

var idleTimer = {
  interval: null,
  running: 0
};

function startIdleTimer() {
  idleTimer.interval = setInterval( () => {
    console.log('idle timer');
    idleTimer.running += 1;
    if( idleTimer.running % 15 === 0 ) {
      console.log('idle', idleTimer.running);
    }
    if( idleTimer.running % 300 === 0 ) {
      // console.log('idle', idleTimer.running);
      // notifier.notify('Idle for ' + idleTimer.running / 60 + ' minute(s)');
      socket.emit('idle',  idleTimer.running / 60);
    }
  }, 1000 );
}

function stopIdleTimer() {
  clearInterval(idleTimer.interval);
  idleTimer.running = 0;
  idleTimer.interval = null;
}


module.exports = { setIo, startIdleTimer, stopIdleTimer, idleTimer };