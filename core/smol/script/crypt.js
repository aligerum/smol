const config = require('./config')
const smolConfig = config()
const Cryptr = require('cryptr')

let Crypt = class {

  constructor() {
    this.encryptionKey = smolConfig.encryptionKey
  }

  // decrypt input data
  decrypt(input, options) {
    let decryptedData = new Cryptr(this.encryptionKey).decrypt(input)
    if (options && options.parse) decryptedData = JSON.parse(decryptedData)
    return decryptedData
  }

  // encrypt input data
  encrypt(input) {
    if (typeof input != 'string') input = JSON.stringify(input)
    return new Cryptr(this.encryptionKey).encrypt(input)
  }

  // set encryption key to use
  key(newKey) {
    this.encryptionKey = newKey || smolConfig.encryptionKey
    return this
  }


}

module.exports = class {

  // forward static methods to instance methods
  static encrypt(input) { return new Crypt().encrypt(input) }
  static decrypt(input, options) { return new Crypt().decrypt(input, options) }
  static key(newKey) { return new Crypt().key(newKey) }

}
