const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const configs = require(__dirname + '/config.json');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = configs[env];
const models = require('./models');
const { router, middlewares, queryBuilder, queryAsync } = require('jsonapi-express-backend')(__dirname, config, models);
// const { router, middlewares, queryBuilder, queryAsync } = require('../jsonapi-reference/index')(__dirname, config, models);

const port = config.port || 3001;

process.on('uncaughtException', function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

/**
 * Setup Express
 */
const app = express();
const request = require('request-promise');
const http = require('http').Server(app);
const io = require('socket.io')(http);
app.use(express.static('public'));
app.use(bodyParser.json({ type: 'application/json' }));

app.use('/api/v1', middlewares.checkJwt);
app.use('/api/v1', middlewares.jsonApi);

app.get('/api/v1/client-ids', (req, res) => {
  let id = 0;
  let clientIds = [];
  _.forOwn(config.clientIds, (params, provider) => {
    id++;
    clientIds.push({
      id,
      type: 'client-id',
      attributes: {
        'client-id': params.clientId,
        provider
      }
    });
  });
  // res.json(clientIds);
  res.jsonApi(clientIds);
});

app.post('/api/v1/got/:provider', (req, res) => {
  const params = config.clientIds[req.params.provider];
  const rawCredentials = params.clientId + ':' + params.secret;
  const encodedCredentials = new Buffer(rawCredentials).toString('base64');
  console.log(params, rawCredentials, encodedCredentials);
  const options = {
    method: 'POST',
    uri: 'https://bitbucket.org/site/oauth2/access_token',
    body: {
      grant_type: 'authorization_code',
      code: req.body.code
    },
    headers: {
      Authorization: encodedCredentials
    }
  };
  request(options)
  .then(response => {
    res.json({
      req: req.body,
      res: response
    });
  })
  .catch(err => {
    console.log(err);
    res.json({
      err: err.message
    })
  });
  
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

