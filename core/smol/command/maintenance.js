const commandScript = require('../script/command')
const config = require('../script/config')
const smolConfig = config()
const fs = require('fs')

// load maintenance effects from cores
let effects = ['Schedules will not be run automatically unless explicitly allowed']
for (let core of commandScript.corePrototypes) {
  let coreJson = require(`${core.path}/core.json`)
  if (coreJson.maintenanceEffects) effects = effects.concat(coreJson.maintenanceEffects.map(effect => `${effect} (${core.name})`))
}

module.exports = {
  description: 'Manage maintenance mode',
  args: [
    'action: Action to perform',
  ],
  argValues: {
    action: [
      'down: Bring app down for maintenance',
      'status: Get status of maintenance mode',
      'up: Bring app up from maintenance',
    ],
  },
  help: {
    'Maintenance Mode Effects': effects.join('\n'),
  },
  exec: async command => {

    // get status of maintenance mode
    if (command.args.action == 'status') {
      console.log(`${smolConfig.appName} is ${smolConfig.maintenanceMode ? 'down for maintenance' : 'live'}`)
    }

    // enable maintenance mode
    if (command.args.action == 'down') {
      smolConfig.maintenanceMode = true
      command.run(`mkdir -p ${process.cwd()}/config`)
      fs.writeFileSync(`${process.cwd()}/config/smol.json`, JSON.stringify(smolConfig, null, 2))
      console.log(command.colors.yellow(`${smolConfig.appName} is down for maintenance`))
    }

    // disable maintenance mode
    if (command.args.action == 'up') {
      smolConfig.maintenanceMode = false
      command.run(`mkdir -p ${process.cwd()}/config`)
      fs.writeFileSync(`${process.cwd()}/config/smol.json`, JSON.stringify(smolConfig, null, 2))
      console.log(command.colors.green(`${smolConfig.appName} is live`))
    }

  },
}
