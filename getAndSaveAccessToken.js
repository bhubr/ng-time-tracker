const ReqStrategy  = require('code-repositories-api-node');
const reqStrategy  = new ReqStrategy();
const repoApis     = require('code-repositories-api-common')(reqStrategy);
const chain        = require('store-chain');
const path         = require('path');
const rootPath     = __dirname;
const configs      = require(rootPath + '/config.json');
const env          = process.env.NODE_ENV ? process.env.NODE_ENV : 'test';
const config       = configs[env];
const models       = require(rootPath + '/models');
const {
  model,
  router,
  middlewares,
  queryBuilder,
  queryAsync }     = require('jsonapi-express-backend')(rootPath, config, models);
const { store }    = model;

function passLog(label) {
  return function(val) {
    console.log(label, val);
    return val;
  };
}

module.exports = function(provider, userId, credentials, code) {
  console.log('getAndSaveAccessToken', provider, userId, credentials, code);

  const api = repoApis.factory(provider, credentials);
  let mustCreateAccount;
  let mustCreateToken;

  // Fire request, store parsed JSON response
  return chain(api.requestAccessToken(code))
  .set('tokens')
  .then(tokens => api.setTokens(tokens))
  .then(() => api.getUser())
  .set('apiUser')
  .then(({ username }) => {
    return store.findRecordBy('account', { userId, username, type: provider })
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
      return store.createRecord('account', accountAttrs)
    });
  })
  .set('accountRecord')
  .get(({ tokens, apiUser, accountRecord }) =>
    store.findRecordBy('apiToken', { accountId: accountRecord.id })
    .then(tokenRecord => {
      mustCreateToken = tokenRecord === false;
      // console.log('mustCreateToken', tokens, mustCreateToken ? 'yes' : 'no');
      // let tokenAttrs = {
      //   accessToken: tokens.accessToken,
      //   username: accountRecord.username
      // };
      // if(tokens.refreshToken) {
      //   tokenAttrs.refreshToken = tokens.refreshToken;
      // }
      const tokenAttrs = Object.assign({
        username: accountRecord.username
      }, tokens);
      console.log(tokens, tokenAttrs);
      // If a token already exists for this account, update it
      if(! mustCreateToken) {
        return store.updateRecord('apiToken', tokenRecord.id, tokenAttrs);
      }
      tokenAttrs.accountId = accountRecord.id;
      // console.log('## Creating token', tokenAttrs);
      return store.createRecord('apiToken', tokenAttrs)
      // .then(passLog('## Created token'))
      .then(record => {
        return store.updateRecord('account', accountRecord.id, { tokenId: record.id })
        .then(() => (record));
      });
    })
  )
  .set('tokenRecord')
  .get(data => {
    // const payload = Object.assign(data, {
    //   mustCreateAccount, mustCreateToken
    // });
    // console.log('## return payload', payload);
    // res.json(payload);
    const { tokenRecord, accountRecord } = data;
    return { tokenRecord, accountRecord };
  })
  .catch(err => {
    console.log(err);
    throw err;
    // res.json({
    //   err: err.message
    // })
  });
  
}