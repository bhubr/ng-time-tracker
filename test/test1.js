const webdriverio = require('webdriverio');
const path        = require('path');
const chai        = require('chai');
const assert      = chai.assert;
const fakers      = require('./fakers');
const { server, emitter } = require('./test-server');

const rootPath    = path.normalize(__dirname + '/..');
const configs     = require(rootPath + '/config.json');
const env         = process.env.NODE_ENV ? process.env.NODE_ENV : 'test';
const config      = configs[env];
const credentials = config.OAuthClients;
const models      = require(rootPath + '/models');

const { model, router, middlewares, queryBuilder, queryAsync } = require('jsonapi-express-backend')(rootPath, config, models);

describe('all tests', () => {

  describe('create user and link accounts', () => {

    it('creates user', () => {
      const attributes = fakers.user();
      return model.store.createRecord('user', attributes)
      .then(user => {
        assert(typeof user.id === 'number');
        assert.equal(user.email, attributes.email, 'user email should be the one provided in attributes');
        assert.equal(user.firstName, attributes.firstName, 'user first name should be the one provided in attributes');
        assert.equal(user.lastName, attributes.lastName, 'user last name should be the one provided in attributes');
        assert.equal(user.password.length, 60, 'hashed password should be 60 characters long');
      });
    });

  });

  describe('BitBucket strategy tests', function(){

    this.timeout(99999999);
    let client;
    let tokens;

    before(
      function() {
        client = webdriverio.remote({ desiredCapabilities: {browserName: 'firefox'} });
        return client.init();
      }
    );

    it('- get authorization code and token',function(done) {
      const authorizeUrl = 'https://bitbucket.org/site/oauth2/authorize'
        + "?client_id=" + credentials.bitbucket.clientId + "&response_type=code";

      emitter.on('err', err => {
        emitter.removeAllListeners();
        done(err);
      });
      emitter.on('token', _tokens => {
        client.end();
        tokens = _tokens;
        emitter.removeAllListeners();
        done();
      });
      client
        .url(authorizeUrl)
        .setValue('input[name="username"]', credentials.bitbucket.email)
        .setValue('input[name="password"]', credentials.bitbucket.password)
        .click('input[type="submit"]')
        .click('button.aui-button:nth-child(1)')
        .pause(1000);
    });

  });

});