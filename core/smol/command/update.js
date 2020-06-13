const commandScript = require('../script/command')
const config = require('../script/config')
const fs = require('fs')
const smolConfig = config()

// load update effects from cores
let effects = [
  'App will enter maintenance mode for the duration of the update',
  'Files will be updated from git',
  'Added npm packages will be installed and existing packages will be updated',
  'Added configs will be generated, and new keys will be added to existing configs',
]
for (let core of commandScript.corePrototypes) {
  let coreJson = require(`${core.path}/core.json`)
  if (coreJson.updateEffects) effects = effects.concat(coreJson.updateEffects.map(effect => `${effect} (${core.name})`))
}

// load update effects from plugins
// FIXME

// load update effects from local scripts
let localScripts = []
if (fs.existsSync(`${process.cwd()}/update`)) for (let updateName of fs.readdirSync(`${process.cwd()}/update`)) localScripts.push({name: updateName.slice(0, -3), def: require(`${process.cwd()}/update/${updateName}`)})
localScripts.sort((a, b) => {
  if (a.def.order < b.def.order) return -1
  if (a.def.order > b.def.order) return 1
  return [a.name, b.name].sort()[0] == a ? -1 : 1
})
for (let localScript of localScripts) effects.push(`${localScript.def.description || 'No description provided'} (update/${localScript.name})`)

module.exports = {
  description: 'Update project files',
  help: {
    'Update Effects': effects.join('\n'),
  },
  exec: async command => {

    // enter maintenance mode
    let isInMaintenanceMode = smolConfig.maintenanceMode
    if (!isInMaintenanceMode) command.run('npx smol maintenance down')

    try {

      // pull files from git
      console.log(command.colors.yellow('Pulling updates from git...'))
      // command.run('git pull')

      // install npm packages
      console.log(command.colors.yellow('Installing and updating npm packages...'))
      // command.run('npm install')

      // add configs
      console.log(command.colors.yellow('Generating and updating configs...'))
      // command.run('npx smol make config')

      // run core functions
      for (let corePrototype of commandScript.corePrototypes) {
        if (!fs.existsSync(`${corePrototype.path}/update.js`)) continue
        let coreNames = []
        if (fs.existsSync(`${process.cwd()}/core`)) coreNames = fs.readdirSync(`${process.cwd()}/core`).filter(coreName => require(`${process.cwd()}/core/${coreName}/core.json`).type == corePrototype.name)
        for (let coreName of coreNames) {
          // await require(`${corePrototype.path}/update`).exec({
          //   coreNames,
          //   run: commandScript.run,
          //   runAsync: commandScript.runAsync,
          //   spawn: commandScript.spawn,
          //   colors: command.colors,
          // })
        }
      }

      // run plugin functions
      for (let plugin of commandScript.plugins) {
        if (!fs.existsSync(`${plugin.path}/update.js`)) continue
        let coreNames = []
        if (fs.existsSync(`${process.cwd()}/core`)) {
          coreNames = fs.readdirSync(`${process.cwd()}/core`).filter(coreName => {
            let coreJson = require(`${process.cwd()}/core/${coreName}/core.json`)
            return coreJson.plugins && coreJson.plugins.includes(plugin.name)
          })
        }
        for (let coreName of coreNames) {
          // await require(`${plugin.path}/update`).exec({
          //   coreNames,
          //   run: commandScript.run,
          //   runAsync: commandScript.runAsync,
          //   spawn: commandScript.spawn,
          //   colors: command.colors,
          // })
        }
      }

      // run local scripts
      for (let localScript of localScripts) {
        await localScript.def.exec({
          run: commandScript.run,
          runAsync: commandScript.runAsync,
          spawn: commandScript.spawn,
          colors: command.colors,
        })
      }

      // done
      console.log(command.colors.green('Update complete!'))

    } catch (err) {
      console.log(err)
      console.log(command.colors.red('Update failed'))
    }

    // re-enable maintenance mode
    if (!isInMaintenanceMode) command.run('npx smol maintenance up')

  },
}
