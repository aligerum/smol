const commandScript = require('../script/command')
const config = require('../script/config')
const colors = require('../script/colors')
const fs = require('fs')
const repl = require('repl')

module.exports = {
  description: 'Run interactive console',
  exec: async command => {

    // start context
    const replServer = repl.start({
      prompt: 'smol > ',
    })
    const context = replServer.context
    command.run(`mkdir -p ${config().historyPath.split('/').filter(segment => segment).slice(0, -1).join('/')}`)
    replServer.setupHistory(config().historyPath, () => {})

    // create core loading function
    let cores = []
    if (fs.existsSync(`${process.cwd()}/core`)) cores = fs.readdirSync(`${process.cwd()}/core`)
    for (let core of cores) {
      let jsonPath = `${process.cwd()}/core/${core}/core.json`
      if (!fs.existsSync(jsonPath)) continue
      let coreJson = require(jsonPath)
      let consolePath = `${commandScript.corePrototypes.find(corePrototype => corePrototype.name == coreJson.type).path}/console.js`
      if (!fs.existsSync(consolePath)) continue
      let coreLoader = require(consolePath)
      context[core] = {}
      coreLoader(context[core], context)
    }

  },
}
