const commandScript = require('../script/command')
const config = require('../script/config')
const fs = require('fs')

let names = []
if (fs.existsSync(`${process.cwd()}/core`)) names = names.concat(fs.readdirSync(`${process.cwd()}/core`))
if (fs.existsSync(`${process.cwd()}/template`)) names = names.concat(fs.readdirSync(`${process.cwd()}/template`).filter(item => item.match(/\.config\.json$/)).map(item => item.replace('.config.json', '')))

module.exports = {
  description: 'Make config files from templates',
  args: [
    `template?=${names.sort().join(',')}: Name of config file to create\nIf none specified, will make all configs`,
    '-e,--edit: Open configs in editor',
    '-f,--force: Overwrite existing configs'
  ],
  exec: async command => {

    // get smol config
    let files = []
    if (!command.args.template || command.args.template == 'smol') files.push({from: `${__dirname}/../template/config.json`, to: 'smol.json'})

    // get core configs
    let cores = []
    if (fs.existsSync(`${process.cwd()}/core`)) cores = fs.readdirSync(`${process.cwd()}/core`)
    for (let core of cores) {
      if (command.args.template && command.args.template != core) continue
      let coreJson = require(`${process.cwd()}/core/${core}/core.json`)
      let configPath = `${commandScript.corePrototypes.find(prototype => prototype.name == coreJson.type).path}/template/config.json`
      if (fs.existsSync(configPath)) files.push({from: configPath, to: `${core}.json`})
    }

    // get custom configs
    if (fs.existsSync(`${process.cwd()}/template`)) {
      let configTemplates = fs.readdirSync(`${process.cwd()}/template`).filter(item => item.match(/\.config\.json$/))
      for (let configTemplate of configTemplates) {
        if (command.args.template && configTemplate.replace('.config.json', '') != command.args.template) continue
        files.push({from: `${process.cwd()}/template/${configTemplate}`, to: `${configTemplate.replace('.config.json', '')}.json`})
      }
    }

    // copy files
    command.run(`mkdir -p ${process.cwd()}/config`)
    for (let file of files) {
      if (fs.existsSync(`${process.cwd()}/config/${file.to}`)) {
        if (!command.args.force) file.isSkipped = true
        else file.isOverwritten = true
      }
      if (!file.isSkipped) command.run(`cp ${file.from} ${process.cwd()}/config/${file.to}`)
    }
    for (let file of files) {
      let color = file.isSkipped ? 'yellow' : 'green'
      let line
      if (file.isSkipped) line = `Skipped config/${file.to} (already exists)`
      else if (file.isOverwritten) line = `Overwrote config/${file.to}`
      else line = `Created config/${file.to}`
      console.log(command.colors[color](line))
    }

    // edit files
    if (command.args.edit) for (let file of files) command.spawn(`${config().editor} ${process.cwd()}/config/${file.to}`)

  },
}
