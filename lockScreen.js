/**
 * Created by Benoît on 14/02/2017.
 */
var exec = require('child_process').exec;
var child;

module.exports = function() {
  child = exec(__dirname + "/lock_session.exe", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
};