let fs = require('fs')
let configs = []

// get config by name
module.exports = name => {
  if (!name) name = 'smol'
  if (configs[name]) return configs[name]
  let paths = [`${process.cwd()}/config/${name}.json`, `${process.cwd()}/template/${name}.config.json`]
  if (name == 'smol') paths.push(`${process.cwd()}/node_modules/smol/core/smol/template/config.json`)
  if (fs.existsSync(`${process.cwd()}/core/${name}`)) {
    let coreJson = require(`${process.cwd()}/core/${name}/core.json`)
    let command = require('./command')
    let configPath = `${command.corePrototypes.find(prototype => prototype.name == coreJson.type).path}/template/config.json`
    if (fs.existsSync(configPath)) paths.push(configPath)
  }
  for (let path of paths) {
    if (fs.existsSync(path)) {
      configs[name] = require(path)
      return configs[name]
    }
  }
}
