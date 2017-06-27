const configs = require(__dirname + '/config.json');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = configs[env];
const { query } = require('jsonapi-express-backend-query')(config.db);
const queryBuilder = require('./node_modules/jsonapi-express-backend/lib/queryBuilder');
const utils = require('./node_modules/jsonapi-express-backend/lib/utils');
const lockScreen = require('./lockScreen');
const { startIdleTimer, stopIdleTimer, notifyTimerDone } = require('./notify');

let timersPerUser = {
  interval: null,
  startTimestamp: 0,
  lastTimestamp: 0,
  current: null
};

function TimerStore() {
  this.timersPerUser = {}
}

TimerStore.prototype.factory = function(timerModel) {
  const { userId } = timerModel;
  console.log('TimerStore.factory', timerModel, userId);
  if(this.timersPerUser[userId]) {
    delete this.timersPerUser[userId];
  }
  this.timersPerUser[userId] = new TimerWrapper(timerModel);
  return this.timersPerUser[userId];
}

const timerStore = new TimerStore();

function TimerWrapper(timerModel) {
  console.log('TimerWrapper constructor', timerModel);
  this.timerId = timerModel.id;
  this.startTimestamp = (new Date()).getTime();
  this.lastTimestamp = (new Date()).getTime();
  this.currentModel = timerModel;
  this.durationMsec = timerModel.duration * 1000;
  this.interval = setInterval(this.onIntervalTick.bind(this), 1000 );
  stopIdleTimer(timerModel.userId);
}

TimerWrapper.prototype.onIntervalTick = function() {
  console.log('TimerWrapper.onIntervalTick');
  let currentTimestamp = (new Date()).getTime();
  console.log('current: ' + this.currentTimestamp + ', prev: ' + this.lastTimestamp+ ', diff: ' + (currentTimestamp - this.lastTimestamp) );
  if( currentTimestamp - this.startTimestamp >= this.durationMsec ) {
    const dateTime = utils.dateToMySQL(new Date());
    const status = currentTimestamp - this.lastTimestamp > 1050 ? 'interrupted' : 'done';
    query(queryBuilder.updateOne('timers', timerId, {
      status,
      stoppedAt: dateTime,
      updatedAt: dateTime
    }))
    .then( () => this.timerStop.bind(this) );
  }
  timer.lastTimestamp = currentTimestamp;
};

TimerWrapper.prototype.timerStop = function() {
  console.log('TimerWrapper.timerStop');
  clearInterval( this.interval );
  this.interval = null;
  this.currentModel = null;
  this.lastTimestamp = 0;
  startIdleTimer(this.currentModel.userId);
  notifyTimerDone(this.currentModel.userId);
  // lockScreen();
};

function afterCreate(timerModel) {
  // WEIRD. Gotta store timer id b/c it gets erased from timerModel later on!!!
  const timerId = timerModel.id;
  const { userId } = timerModel;
  console.log('timerModel user', timerModel, userId);
  const wrapper = timerStore.factory(timerModel);


  // let currentTimestamp;
  // timer.current = timerModel;
  // console.log( 'starting timer for user', userId + '/' + timerModel.userId, 'with duration (s):', timerModel.duration);


  return Promise.resolve(timerModel);
}

module.exports = { afterCreate };