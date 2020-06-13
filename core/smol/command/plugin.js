const commandScript = require('../script/command')
const fs = require('fs')

let argValues = {
  plugin: []
}
for (let plugin of commandScript.plugins) {
  let pluginJson = require(`${plugin.path}/plugin.json`)
  argValues.plugin.push(`${plugin.name}: ${pluginJson.description} Plugin`)
}

module.exports = {
  description: 'Add or remove a plugin to/from a core',
  args: [
    'action=add,remove: Action to perform',
    'plugin: Plugin to add/remove',
    'core@: Core to add/remove plugin to/from',
  ],
  argValues,
  exec: async command => {

    // open core and plugin's json
    let plugin = commandScript.plugins.find(plugin => plugin.name == command.args.plugin)
    let coreJson = require(`${command.info.core.path}/core.json`)
    let pluginJson = require(`${plugin.path}/plugin.json`)

    // add core to plugins list
    if (!coreJson.plugins) coreJson.plugins = []
    if (command.args.action == 'add' && coreJson.plugins.includes(command.args.plugin)) {
      console.log(command.colors.yellow(`Core "${command.args.core}" already has ${pluginJson.description} Plugin enabled`))
      process.exit(1)
    } else if (command.args.action == 'remove' && !coreJson.plugins.includes(command.args.plugin)) {
      console.log(command.colors.yellow(`Core "${command.args.core}" does not have ${pluginJson.description} Plugin enabled`))
      process.exit(1)
    }
    if (command.args.action == 'add') coreJson.plugins.push(command.args.plugin)
    else if (command.args.action == 'remove') coreJson.plugins.splice(coreJson.plugins.indexOf(command.args.plugin), 1)

    // write json
    fs.writeFileSync(`${command.info.core.path}/core.json`, JSON.stringify(coreJson, null, 2))

    // output
    if (command.args.action == 'add') console.log(command.colors.green(`${pluginJson.description} Plugin added to "${command.args.core}" core`))
    else if (command.args.action == 'remove') console.log(command.colors.green(`${pluginJson.description} Plugin removed from "${command.args.core}" core`))

    // run add script
    if (command.args.action == 'add' && fs.existsSync(`${plugin.path}/add.js`)) {
      process.env.SMOL_CORE = command.args.core
      let add = require(`${plugin.path}/add.js`)
      add.exec()
    } else if (command.args.action == 'remove' && fs.existsSync(`${plugin.path}/remove.js`)) {
      process.env.SMOL_CORE = command.args.core
      let remove = require(`${plugin.path}/remove.js`)
      remove.exec()
    }

  },
}
