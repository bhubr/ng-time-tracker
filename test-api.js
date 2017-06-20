const request = require('request-promise');
const config = require('./config.json').development;
const params = config.OAuthClients.bitbucket;
let uri;

// Encode provider credentials to base64
const rawCredentials = params.clientId + ':' + params.secret;
const encodedCredentials = new Buffer(rawCredentials).toString('base64');
console.log(encodedCredentials);

const authorizeUrl =  "https://bitbucket.org/site/oauth2/authorize";
uri = authorizeUrl + "?client_id=" + params.clientId + "&response_type=code";
const options = {
  method: 'GET',
  uri
}
// uri = 'https://bitbucket.org/site/oauth2/access_token';
// const headers = {
//   Authorization: 'Basic ' + encodedCredentials
// };
// const options = {
//   method: 'POST',
//   uri,
//   form: Object.assign({}, {
//     grant_type: 'authorization_code',
//     code: req.body.code
//   }),
//   headers
// };
// console.log(options);

request(options)
.then(response => {
  console.log(response)
})
.catch(err => {
  console.error(response)
})
    // + (providerParams.redirectUri ? ('&redirect_uri=' + providerParams.redirectUri) : '');