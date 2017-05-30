const _ = require('lodash');
const chain = require('store-chain');
const express = require('express');
const bodyParser = require('body-parser');
const configs = require(__dirname + '/config.json');
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
const config = configs[env];
const models = require('./models');
const { router, middlewares, queryBuilder, queryAsync } = require('jsonapi-express-backend')(__dirname, config, models);
// const { router, middlewares, queryBuilder, queryAsync } = require('../jsonapi-reference/index')(__dirname, config, models);

const port = config.port || 3001;

const objWrapper = {
  createOne: function(table, attributes) {
    const insertQuery = queryBuilder.insert(table, attributes);
    return queryAsync(insertQuery)
    .then(res => queryBuilder.selectOne(table, res.insertId))
    .then(queryAsync)
    .then(records => Object.assign({}, records[0]));
  }
}

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
const RequestStrategy = require('code-repositories-api-node');
const requestStrategy = new RequestStrategy;
const repoApis = require('code-repositories-api-common')(requestStrategy);
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
  const { provider } = req.params;
  const { userId } = req.jwt;
  const params = config.clientIds[provider];
  const rawCredentials = params.clientId + ':' + params.secret;
  const encodedCredentials = new Buffer(rawCredentials).toString('base64');
  console.log(params, rawCredentials, encodedCredentials);
  const options = {
    method: 'POST',
    uri: 'https://bitbucket.org/site/oauth2/access_token',
    form: {
      grant_type: 'authorization_code',
      code: req.body.code
    },
    headers: {
      Authorization: 'Basic ' + encodedCredentials
    },
    // json: true
  };
  console.log(options);
  chain(request(options))
  .then(response => JSON.parse(response))
  .set('token')
  .then(responseBody => {
    console.log('## Access token', responseBody.access_token);
    return repoApis.bitbucket.setToken(responseBody.access_token);
  })
  .set('apiUser')
  .then(user => {
    const { username } = user;
    const name = username + '@' + provider;
    const accountAttrs = {
      type: provider, username, userId, name 
    };
    return objWrapper.createOne('accounts', accountAttrs)
    // console.log('## User', user);
    // repoApis.bitbucket.getProjects()
    // .then(projectsRes => {
    //   res.json({
    //     req: req.body,
    //     responseBody,
    //     projectsRes
    //   });
    // })

  })
  .then(attrs => { console.log('account attrs', attrs); return attrs; })
  .set('account')
  .get(({ account, token }) => ({
    accountId: account.id,
    access_token: token.access_token,
    refresh_token: token.refresh_token
  }))
  .then(attrs => { console.log('token attrs', attrs); return attrs; })
  .then(tokenAttrs => objWrapper.createOne('api_tokens', tokenAttrs))
  .set('tokenRecord')
  .get(data => {
    res.json(data);    
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

