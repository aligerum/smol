const fs = require('fs')
const config = require('../script/config')
const string = require('../script/string')

module.exports = {
  description: 'Generate app encryption key',
  args: [
    '-f,--force: Overwrite existing key',
  ],
  exec: async command => {

    // get core config
    let smolConfig = config()

    // don't overwrite if encryption key already exists
    if (!command.args.force && smolConfig.encryptionKey) {
      console.log(command.colors.yellow(`Encryption key already exists`))
      process.exit(1)
    }

    // generate password
    let key = string.generate({
      chars: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*-_=+()[]{}<>,.?`~:;\'\"/\\|',
      length: 64
    })
    smolConfig.encryptionKey = key

    // save config
    command.run(`mkdir -p ${process.cwd()}/config`)
    fs.writeFileSync(`${process.cwd()}/config/smol.json`, JSON.stringify(smolConfig, null, 2))
    console.log(command.colors.green(`Generated app encryption key`))

  },
}
