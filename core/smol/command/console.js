const commandScript = require('../script/command')
const config = require('../script/config')
const colors = require('../script/colors')
const fs = require('fs')
const repl = require('repl')
const string = require('../script/string')

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

    // load all packages
    let packages = {}
    let packageJson = require(`${process.cwd()}/package.json`)
    if (packageJson.dependencies) for (let packageName in packageJson.dependencies) packages[packageName] = packageJson.dependencies[packageName]
    if (packageJson.devDependencies) for (let packageName in packageJson.devDependencies) packages[packageName] = packageJson.devDependencies[packageName]
    for (let packageName in packages) {
      let packagePath = packages[packageName][0] == '.' ? `${process.cwd()}/${packages[packageName]}` : `${process.cwd()}/node_modules/${packageName}`
      context[string.camelCase(packageName)] = require(packagePath)
    }

    // load core functionality
    let cores = []
    if (fs.existsSync(`${process.cwd()}/core`)) cores = fs.readdirSync(`${process.cwd()}/core`)
    for (let core of cores) {
      context[core] = {}
      let jsonPath = `${process.cwd()}/core/${core}/core.json`
      if (!fs.existsSync(jsonPath)) continue
      let coreJson = require(jsonPath)
      let consolePath = `${commandScript.corePrototypes.find(corePrototype => corePrototype.name == coreJson.type).path}/console.js`
      if (!fs.existsSync(consolePath)) continue
      let coreLoader = require(consolePath)
      coreLoader(core, context[core], context)
    }

    // load plugin functionality
    let plugins = []
    for (let plugin of commandScript.plugins) {
      context[plugin.name] = {}
      if (!fs.existsSync(`${plugin.path}/console.js`)) continue
      let pluginLoader = require(`${plugin.path}/console.js`)
      pluginLoader(context[plugin.name], context)
    }

  },
}
