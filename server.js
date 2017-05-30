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
  create: function(table, attributes) {
    const insertQuery = queryBuilder.insert(table, attributes);
    return queryAsync(insertQuery)
    .then(res => queryBuilder.selectOne(table, res.insertId))
    .then(queryAsync)
    .then(records => Object.assign({}, records[0]));
  },

  findById: function(table, id) {
    const selectQuery = queryBuilder.selectOne(table, id);
    return queryAsync(selectQuery)
    .then(records => Object.assign({}, records[0]));
  },

  findBy: function(table, where, multi) {
    const selectQuery = queryBuilder.selectWhere(table, where);
    return queryAsync(selectQuery)
    .then(records => (!! multi ? records :
      (records.length ? records[0] : false)));
  },

  update: function(table, id, attributes) {
    const updateQuery = queryBuilder.updateOne(table, id, attributes);
    const selectQuery = queryBuilder.selectOne(table, id);
    return queryAsync(updateQuery)
    .then(() => queryAsync(selectQuery))
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

function getAccount(userId, provider, username) {
  return objWrapper.findBy('accounts', { userId, username, type: provider });
}

function getToken(accountId) {
  return objWrapper.findBy('api_tokens', { accountId });
}

function passLog(label) {
  return function(val) {
    console.log(label, val);
    return val;
  };
}

app.post('/api/v1/sync/repos/:accountId', (req, res) => {
  objWrapper.findById('accounts', req.params.accountId)
  .then(account => {
    if(account.userId !== req.jwt.userId) {
      return res.status(403).json({ error: "You don't have access rights to access this resource" });
    }
    return objWrapper.findById('api_tokens', account.tokenId);
  })
  .then(token => repoApis.bitbucket.setToken(token.access_token))
  .then(() => repoApis.bitbucket.getProjects())
  .then(projectsRes => {
    console.log(projectsRes);
    res.json({
      projectsRes
    });
  });

});

app.post('/api/v1/got/:provider', (req, res) => {

  // Get params
  //   * From request: provider (bitbucket, github, etc.)
  //   * From JWT: current user's ID
  //   * From config: Client ID (key) and secret for provider
  const { provider } = req.params;
  const { userId } = req.jwt;
  const params = config.clientIds[provider];

  // Encode provider credentials to base64
  const rawCredentials = params.clientId + ':' + params.secret;
  const encodedCredentials = new Buffer(rawCredentials).toString('base64');

  let mustCreateAccount;
  let mustCreateToken;

  // Prepare request to provider's access token route
  const options = {
    method: 'POST',
    uri: 'https://bitbucket.org/site/oauth2/access_token',
    form: {
      grant_type: 'authorization_code',
      code: req.body.code
    },
    headers: {
      Authorization: 'Basic ' + encodedCredentials
    }
  };

  // Fire request, store parsed JSON response
  chain(request(options))
  .then(response => JSON.parse(response))
  .set('token')
  // Setup the provider strategy with freshly got access token
  .then(token => repoApis.bitbucket.setToken(token.access_token))
  .set('apiUser')
  .then(({ username }) => {
    return getAccount(userId, provider, username)
    .then(passLog('## getAccount result'))
    .then(account => {
      // Bypass if an account already exists
      mustCreateAccount = account === false;
      console.log('mustCreateAccount', mustCreateAccount ? 'yes' : 'no');
      if(! mustCreateAccount) {
        return account;
      }
      // Otherwise create
      const name = username + '@' + provider;
      const accountAttrs = {
        type: provider, username, userId, name 
      };
      return objWrapper.create('accounts', accountAttrs)
    });
  })
  .set('account')
  // .get(passLog('## store chain content'))
  .get(({ token, apiUser, account }) => {
    return getToken(account.id)
    .then(tokenRecord => {
      mustCreateToken = tokenRecord === false;
      console.log('mustCreateToken', mustCreateToken ? 'yes' : 'no');
      let tokenAttrs = {
        access_token: token.access_token,
        refresh_token: token.refresh_token
      };
      // If a token already exists for this account, update it
      if(! mustCreateToken) {
        return objWrapper.update('api_tokens', tokenRecord.id, tokenAttrs);
      }
      tokenAttrs.accountId = account.id;
      return objWrapper.create('api_tokens', tokenAttrs)
      .then(record => {
        return objWrapper.update('accounts', account.id, { tokenId: record.id })
        .then(() => (record));
      });
    });
  })
  // .then(passLog('## tokenRecord'))



  // .get(({ account, token }) => ({
  //   accountId: account.id,
  //   access_token: token.access_token,
  //   refresh_token: token.refresh_token
  // }))
  // .then(attrs => { console.log('token attrs', attrs); return attrs; })
  // .then(tokenAttrs => objWrapper.create('api_tokens', tokenAttrs))
  .set('tokenRecord')
  .get(data => {
    const payload = Object.assign(data, {
      mustCreateAccount, mustCreateToken
    });
    console.log('## return payload', payload);
    res.json(payload);
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

