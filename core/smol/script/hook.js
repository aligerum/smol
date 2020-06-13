const fs = require('fs')
const command = require('./command')

module.exports = (name, data) => {

  // go through core hooks
  let hooks = []
  if (fs.existsSync(`core/${process.env.SMOL_CORE}/hook`)) hooks = hooks.concat(fs.readdirSync(`core/${process.env.SMOL_CORE}/hook`).filter(file => file.slice(0, -3) == name).map(file => `${process.cwd()}/core/${process.env.SMOL_CORE}/hook/${file.slice(0, -3)}`))

  // go through plugins
  let coreJson = require(`${process.cwd()}/core/${process.env.SMOL_CORE}/core.json`)
  for (let plugin of command.plugins) {
    if (!coreJson.plugins || !coreJson.plugins.includes(plugin.name)) continue
    if (fs.existsSync(`${plugin.path}/core/${coreJson.type}/hook`)) hooks = hooks.concat(fs.readdirSync(`${plugin.path}/core/${coreJson.type}/hook`).filter(file => file.slice(0, -3) == name).map(file => `${plugin.path}/core/${coreJson.type}/hook/${file.slice(0, -3)}`))
  }

  // run all hooks
  let responses = []
  for (let hookFile of hooks) {
    let hook = require(hookFile)
    if (hook.exec) responses.push(hook.exec(data))
  }
  return responses

}
