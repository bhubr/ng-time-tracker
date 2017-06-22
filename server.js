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
  return getAccountProjects(req.params.accountId, req.jwt.userId)
  .then(projects => res.json(projects))
  .catch(err => res.status(500).json({ error: err.message }))
  // let apiStrategy;
  // let apiAccount;
  // let toto;
  // objWrapper.findById('accounts', req.params.accountId)
  // .then(account => {
  //   if(account.userId !== req.jwt.userId) {
  //     return res.status(403).json({ error: "You don't have access rights to access this resource" });
  //   }
  //   apiAccount = account;
  //   apiStrategy = repoApis[account.type];
  //   return objWrapper.findById('api_tokens', account.tokenId);
  // })
  // .then(token => apiStrategy.setToken(token.access_token))
  // .then(() => apiStrategy.getProjects())
  // .then(projectsRes => {
  //   console.log('\n\n###### RETURNED FROM REPOS QUERY\n', projectsRes);
  //   // fs.writeFileSync(dump, JSON.stringify(projectsRes));

  //   Promise.map(projectsRes, entry => {
  //     const { uuid, name, fullName, htmlUrl } = entry;
  //     const attrs = {
  //       userId: req.jwt.userId,
  //       accountId: apiAccount.id,
  //       remoteUuid: uuid,
  //       name,
  //       fullName,
  //       htmlUrl
  //     };
  //     return objWrapper.findBy('remote_projects', {
  //       remoteUuid: uuid
  //     })
  //     .then(existing => ( existing ?
  //       Object.assign( existing, { isNew: false } ) :
  //       objWrapper.create('remote_projects', attrs)
  //       .then(record => Object.assign( record, { isNew: true } ))
  //     ) );
  //   })
  //   .then(records => {
  //     res.json({
  //       records
  //     });
  //   })
  // })
  // .catch(err => {
  //   console.log('\n## Fatal', err);
  //   res.json({ error: err.message });
  // });

});

app.post('/api/v1/sync/issues/:remoteId',
  (req, res) => {
    getRemoteIssues(req.params.remoteId, req.jwt.userId)
    .then(issues => res.json(issues))
    .catch(err => res.status(500).json({ error: err.message }))
    // let account;
    // let remote;
    // let name;
    // let fullName;
    // console.log('server sync issues', req.params);
    // model.store.findRecord('remoteProject', req.params.remoteId)
    // .then(_remote => {
    //   if(! _remote) {
    //     return res.status(404).json({ error: 'Remote not found' });
    //   }
    //   // if(_remote.accountId !== account.id) {
    //   //   return res.status(400).json({ error: "Remote and account id don't match" });
    //   // }
    //   console.log('#2 found remote', _remote);
    //   remote = _remote;
    //   name = remote.name;
    //   fullName = remote.fullName;
    //   return _remote;
    // })
    // .then(remote => model.store.findRecord('account', remote.accountId))
    // .then(_account => {
    //   if(! _account) {
    //     return res.status(404).json({ error: 'Account not found' });
    //   }
    //   if(_account.userId !== req.jwt.userId) {
    //     return res.status(403).json({ error: "You don't have access rights to access this resource" });
    //   }
    //   console.log('#1 found account', _account);
    //   account = _account;
    // })

    // .then(() => {
    //   apiAccount = account;
    //   apiStrategy = repoApis[account.type];
    //   return objWrapper.findById('api_tokens', account.tokenId);
    // })
    // .then(token => apiStrategy.setToken(token.access_token))
    // .then(() => apiStrategy.getIssuesFor({ name, fullName }))
    // .then(issuesRes => {
    //   console.log('\n\n###### RETURNED FROM ISSUES QUERY\n', issuesRes);
    //   // fs.writeFileSync(dump, JSON.stringify(projectsRes));
    //   return res.json(issuesRes);
    // })
    // .catch(err => {
    //   console.log('\n## Fatal', err);
    //   res.json({ error: err.message });
    // });

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
    const { code } = req.query;
    return getAndSaveAccessToken(provider, userId, credentials, code)
  // Get params
  //   * From request: provider (bitbucket, github, etc.)
  //   * From JWT: current user's ID
  //   * From config: Client ID (key) and secret for provider
  // const api = repoApis.factory(provider, params);

  // let mustCreateAccount;
  // let mustCreateToken;


  // // Fire request, store parsed JSON response
  // chain(api.requestAccessToken())
  // .then(passLog('## parsed response for token request'))
  // .then(tokens => api.setTokens(tokens))
  // .then(passLog('## return from set token'))
  // .set('tokens')
  // .then(() => api.getUser())
  // .set('apiUser')
  // .then(passLog('## return from get user'))
  // // .then(passLog('## server response from ' + provider))
  // // .then(response => JSON.parse(response))
  // // .then(paramsPerProvider[provider].extract)
  // // Setup the provider strategy with freshly got access token
  // // .then(token => repoApis[provider].setToken(token.access_token))
  // // .then(passLog('## setToken / getUser result'))
  // // .set('apiUser')
  // .then(({ username }) => {
  //   return getAccount(userId, provider, username)
  //   .then(passLog('## getAccount result'))
  //   .then(account => {
  //     // Bypass if an account already exists
  //     mustCreateAccount = account === false;
  //     console.log('mustCreateAccount', mustCreateAccount ? 'yes' : 'no');
  //     if(! mustCreateAccount) {
  //       return account;
  //     }
  //     // Otherwise create
  //     const name = username + '@' + provider;
  //     const accountAttrs = {
  //       type: provider, username, userId, name 
  //     };
  //     console.log('## Creating account', accountAttrs);
  //     return objWrapper.create('accounts', accountAttrs)
  //   });
  // })
  // .then(passLog('## Created account'))
  // .set('account')
  // // .get(passLog('## store chain content'))
  // .get(({ tokens, apiUser, account }) => {
  //   return getToken(account.id)
  //   .then(tokenRecord => {
  //     mustCreateToken = tokenRecord === false;
  //     console.log('mustCreateToken', mustCreateToken ? 'yes' : 'no');
  //     let tokenAttrs = {
  //       access_token: token.access_token
  //     };
  //     if(token.refresh_token) {
  //       tokenAttrs.refresh_token = token.refresh_token;
  //     }
  //     // If a token already exists for this account, update it
  //     if(! mustCreateToken) {
  //       return objWrapper.update('api_tokens', tokenRecord.id, tokenAttrs);
  //     }
  //     tokenAttrs.accountId = account.id;
  //     console.log('## Creating token', tokenAttrs);
  //     return objWrapper.create('api_tokens', tokenAttrs)
  //     .then(passLog('## Created token'))
  //     .then(record => {
  //       return objWrapper.update('account', account.id, { tokenId: record.id })
  //       .then(() => (record));
  //     });
  //   });
  // })
  // .set('tokenRecord')
  // .get(data => {
  //   const payload = Object.assign(data, {
  //     mustCreateAccount, mustCreateToken
  //   });
  //   console.log('## return payload', payload);
  //   res.json(payload);
  // })
  // .catch(err => {
  //   console.log(err);
  //   res.json({
  //     err: err.message
  //   })
  // });
  
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

