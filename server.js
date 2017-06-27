const _ = require('lodash');
const fs = require('fs');
const chain = require('store-chain');
const express = require('express');
const bodyParser = require('body-parser');
const configs = require(__dirname + '/config.json');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = configs[env];
const models = require('./models');
const { model, router, middlewares, queryBuilder, queryAsync } = require('jsonapi-express-backend')(__dirname, config, models);
// const { router, middlewares, queryBuilder, queryAsync } = require('../jsonapi-express-backend/index')(__dirname, config, models);
const Promise = require('bluebird');
const querystring = require('querystring');
const request = require('request-promise');
const RequestStrategy = require('code-repositories-api-node');
const requestStrategy = new RequestStrategy;
const repoApis = require('code-repositories-api-common')(requestStrategy);
// const repoApis = require('../code-repositories-api')(requestStrategy);
const getAndSaveAccessToken = require('./getAndSaveAccessToken');
const getAccountProjects = require('./getAccountProjects');
const getRemoteIssues = require('./getRemoteIssues');
const port = config.port || 3001;

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

/**
 * Setup Express
 */
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static('public'));
app.use(bodyParser.json({ type: 'application/json' }));

app.use('/api/v1', middlewares.checkJwt);
app.use('/api/v1', middlewares.jsonApi);

app.get('/api/v1/client-ids', (req, res) => {
  let id = 0;
  let clients = [];
  _.forOwn(config.OAuthClients, (params, provider) => {
    id++;
    let client = {
      id,
      type: 'client-id',
      attributes: {
        'client-id': params.clientId,
        provider
      }
    };
    if(params.redirectUri) {
      client.attributes['redirect-uri'] = params.redirectUri;
    }
    clients.push(client);
  });
  // res.json(clientIds);
  res.jsonApi(clients);
});

function passLog(label) {
  return function(val) {
    console.log(label, val);
    return val;
  };
}

app.post('/api/v1/sync/repos/:accountId', (req, res) => {
  return getAccountProjects(req.params.accountId, req.jwt.userId)
  .then(projects => res.json(projects))
  .catch(err => res.status(500).json({ error: err.message }))
});

app.post('/api/v1/sync/issues/:remoteId',
  (req, res) => {
    getRemoteIssues(req.params.remoteId, req.jwt.userId)
    .then(issues => res.json(issues))
    .catch(err => res.status(500).json({ error: err.message }))
});

function checkProvider(req, res, next) {
  const { provider } = req.params;
  if(['bitbucket', 'github', 'gitlab'].indexOf(provider) === -1) {
    return res.status(404).json({ error: 'Not found (unknown provider: ' + provider + ')' });
  }
  next();
}

app.post('/api/v1/got/:provider', 
  checkProvider,
  (req, res) => {
    const { provider } = req.params;
    const { userId } = req.jwt;
    const credentials = config.OAuthClients[provider];
    const { code } = req.body;
    return getAndSaveAccessToken(provider, userId, credentials, code)
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.message }))
});

app.use('/api/v1', router);


app.get(/^[^\.]+$/, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// models.Option.fetchAll()
queryAsync(queryBuilder.selectAll('options'))
  .then(records => {
    global.durations = {};
    records.forEach(record => {
      const { key, value } = record;
      if( key.endsWith('Duration')) {
        global.durations[key.replace('Duration', '')] = value;
      }
    });
    console.log(global.durations);
    http.listen(port, function () {
      console.log('Example app listening on port ' + port);
      var notify = require('./notify');
      notify.setIo(io);
    });
  });

