const bcrypt = require('bcrypt')
const md5 = require('md5')

module.exports = {

  // compare plaintext to hash
  async compare(plaintext, hash) {
    return bcrypt.compare(plaintext, hash)
  }

  // make a hash from input
  async make(input) {
    return bcrypt.hash(input, 10)
  }

  // make md5 hash from input
  md5(input) {
    return md5(input)
  }

}
