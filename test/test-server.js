const path         = require('path');
const rootPath     = path.normalize(__dirname + '/..');
const configs      = require(rootPath + '/config.json');
const env          = process.env.NODE_ENV ? process.env.NODE_ENV : 'test';
const config       = configs[env];
const credentials  = config.OAuthClients;
const express      = require('express');
const server       = express();
const EventEmitter = require('events');
const fakers       = require('./fakers');
const emitter      = new EventEmitter();
const ReqStrategy  = require('code-repositories-api-node');
const reqStrategy  = new ReqStrategy();
const repoApis     = require('code-repositories-api-common')(reqStrategy);
const models       = require(rootPath + '/models');
const { model, router, middlewares, queryBuilder, queryAsync } = require('jsonapi-express-backend')(rootPath, config, models);
const getAndSaveAccessToken = require('../getAndSaveAccessToken');

server.get('/cb/:provider', function (req, res) {
  if(! req.query.code) {
    return res.status(400).send('Bad Request: no code provided');
  }
  const { provider } = req.params;
  const { code } = req.query;
  const api = repoApis.factory(provider, credentials[provider])
  // console.log('callback for', provider, credentials[provider]);

  const attributes = fakers.user();
  return model.store.createRecord('user', attributes)
  .then(user => {
    // api.requestAccessToken(req.query.code)
    getAndSaveAccessToken(provider, user.id, credentials[provider], code)
    .then(tokens => {
      res.json(tokens);
      console.log(tokens);
      emitter.emit('token', tokens);
    })
    
  })
  .catch(err => {
    console.log('\n\n### CAUGHT ERR ###\n', err);
    emitter.emit('err', new Error(typeof err === 'string' ? err.substr(0, 100): Object.keys(err)));
  });


});

server.listen(3033, function () {
  console.log('Test server listening on port 3033!');
});

module.exports = {
  server, emitter
};