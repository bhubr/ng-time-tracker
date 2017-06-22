const Chance = require('chance');
const chance = new Chance();
const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const SALT_WORK_FACTOR = 10;

function hashPasswordSync(password) {
  const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
  return bcrypt.hashSync(password, salt);
}

const fakers = {
  user: function() {
    return {
      email: chance.email(),
      firstName: chance.first(),
      lastName: chance.last(),
      password: hashPasswordSync('Dummy12#'),
      roleId: 1
    }
  }
}

module.exports = fakers;