const Promise      = require('bluebird');
const ReqStrategy  = require('code-repositories-api-node');
const reqStrategy  = new ReqStrategy();
const repoApis     = require('code-repositories-api-common')(reqStrategy);
const chain        = require('store-chain');
const path         = require('path');
const rootPath     = __dirname;
const configs      = require(rootPath + '/config.json');
const env          = process.env.NODE_ENV ? process.env.NODE_ENV : 'test';
const config       = configs[env];
const credentials  = config.OAuthClients;
const models       = require(rootPath + '/models');
const {
  model,
  router,
  middlewares,
  queryBuilder,
  queryAsync }     = require('jsonapi-express-backend')(rootPath, config, models);
const { store }    = model;

// app.post('/api/v1/sync/repos/:accountId', (req, res) => {
module.exports = function(accountId, userId) {
  let apiStrategy;
  let apiAccount;
  let toto;
  accountId = parseInt(accountId, 10);
  userId = parseInt(userId, 10);
  return store.findRecord('account', accountId)
  .then(account => {
    console.log(account, userId)

    if(account.userId !== userId) {
      // return res.status(403).json({ error: "You don't have access rights to access this resource" });
      throw new Error('ErrorForbiddenAccount:' + accountId);
    }
    apiAccount = account;
    apiStrategy = repoApis.factory(account.type, credentials[account.type]);
    return store.findRecord('apiToken', account.tokenId);
  })
  .then(tokens => apiStrategy.setTokens(tokens))
  .then(() => apiStrategy.getProjects())
  .then(projectsRes => {
    // console.log('\n\n###### RETURNED FROM REPOS QUERY\n', projectsRes);

    return Promise.map(projectsRes, entry => {
      const { uuid, name, fullName, htmlUrl } = entry;
      const attrs = {
        userId,
        accountId: apiAccount.id,
        remoteUuid: uuid,
        name,
        fullName,
        htmlUrl
      };
      return store.findRecordBy('remoteProject', {
        remoteUuid: uuid
      })
      .then(existing => ( existing ?
        Object.assign( existing, { isNew: false } ) :
        store.createRecord('remoteProject', attrs)
        .then(record => Object.assign( record, { isNew: true } ))
      ) );
    })
    // .then(records => {
    //   // res.json({
    //   //   records
    //   // });
    // })
  })
  // .catch(err => {
  //   console.log('\n## Fatal', err);
  //   res.json({ error: err.message });
  // });

};