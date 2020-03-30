const Command = require('../class/Command')
const consoleConfig = require('../config/console.config')
const col = require('../class/OutputColors')
const fs = require('fs')
const repl = require('repl')

module.exports = class extends Command {

  // help description
  static description = 'Run interactive console'

  // signature of command
  static signature = ''

  // description of arguments
  static arguments = {}

  // description of options
  static options = {}

  // additional help sections
  static help = {}

  // execute function
  async exec() {

    // start context
    const replServer = repl.start()
    const context = replServer.context
    this.run(`mkdir -p ${consoleConfig.historyPath.split('/').filter(item => item).slice(0, -1).join('/')}`)
    replServer.setupHistory(consoleConfig.historyPath, () => {})

    // add helpers
    let helpers = {
      axios: 'axios',
      fs: 'fs',
      moment: 'moment',
    }
    for (let name in helpers) context[name] = require(helpers[name])

    // add config to context
    let configNames = fs.readdirSync('platform/all/config').filter(item => item != '.gitignore').map(item => item.slice(0, -10))
    for (let configName of configNames) context[`${configName}Config`] = require(`../config/${configName}.config`)

    // add classes to context
    let classNames = fs.readdirSync('platform/all/class').map(item => item.slice(0, -3))
    for (let className of classNames) context[className] = require(`../class/${className}`)
    classNames = fs.readdirSync('platform/api/class').map(item => item.slice(0, -3))
    for (let className of classNames) context[className] = require(`../../api/class/${className}`)

    // add models to context
    let modelNames = fs.readdirSync('platform/api/model').map(item => item.slice(0, -3))
    for (let modelName of modelNames) context[modelName] = require(`../../api/model/${modelName}`)

  }

}
