const request = require('request-promise');

function RequestStrategy() {
  this.headers = {};
  this.relativePath = '';
  this.baseUri = '';
  this.get = function(overrideUrl, overrideHeaders) {
    var uri = overrideUrl || (this.baseUri + this.relativePath);
    var headers = overrideHeaders || this.headers;
    var options = { method: 'GET', headers, uri };
    console.log('RequestStrategy GET', overrideUrl, options);
    return request(options)
    .then(passLog('## result of GET ' + url))
    // .then(response => (response.data))
    // .then(passLog('## result of GET extract data'));
  };
}
RequestStrategy.prototype.setup = function(baseUri, relativePath, headers) {
  console.log('requestStrategy.setup', baseUri, relativePath, headers);
  this.baseUri = baseUri;
  this.headers = headers;
  this.relativePath = relativePath;
};
RequestStrategy.prototype.setHeaders = function(headers) {
  console.log('requestStrategy.setHeaders', headers);
  this.headers = headers;
};
RequestStrategy.prototype.setBaseUri = function(baseUri) {
  console.log('requestStrategy.setBaseUri', baseUri);
  this.baseUri = baseUri;
};
RequestStrategy.prototype.setPath = function(relativePath) {
  console.log('requestStrategy.setPath', relativePath);
  this.relativePath = relativePath;
};

module.exports = RequestStrategy;