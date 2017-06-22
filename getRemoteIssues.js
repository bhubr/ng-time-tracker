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

// app.post('/api/v1/sync/issues/:remoteId',
//   (req, res) => {
module.exports = function(remoteId, userId) {
    let account;
    let remote;
    let name;
    let fullName;
    let apiStrategy;
    let apiAccount;
    remoteId = parseInt(remoteId, 10);
    userId = parseInt(userId, 10);
    // console.log('server sync issues', req.params);
    return store.findRecord('remoteProject', remoteId)
    .then(_remote => {
      if(! _remote) {
        // return res.status(404).json({ error: 'Remote not found' });
        throw new Error('ErrorNotFoundRemote:' + remoteId);
      }
      // console.log('#2 found remote', _remote);
      remote = _remote;
      name = remote.name;
      fullName = remote.fullName;
      return _remote;
    })
    .then(remote => store.findRecord('account', remote.accountId))
    .then(_account => {
      if(! _account) {
        // return res.status(404).json({ error: 'Account not found' });
        throw new Error('ErrorNotFoundAccount:' + remote.accountId);
      }
      if(_account.userId !== userId) {
        console.log(remoteId, remote, _account, userId);
        // return res.status(403).json({ error: "You don't have access rights to access this resource" });
        throw new Error('ErrorForbiddenAccount:' + remote.accountId);
      }
      // console.log('#1 found account', _account);
      account = _account;
    })

    .then(() => {
      apiAccount = account;
      apiStrategy = repoApis.factory(account.type, credentials[account.type]);
      console.log('## name, fullName', name, fullName);
      return store.findRecord('apiToken', account.tokenId);
    })
    .then(tokens => apiStrategy.setTokens(tokens))
    .then(() => apiStrategy.getIssuesFor({ name, fullName }))
    // .then(issuesRes => {
    //   console.log('\n\n###### RETURNED FROM ISSUES QUERY\n', issuesRes);
    //   // fs.writeFileSync(dump, JSON.stringify(projectsRes));
    //   return res.json(issuesRes);
    // })
    // .catch(err => {
    //   console.log('\n## Fatal', err);
    //   res.json({ error: err.message });
    // });

};