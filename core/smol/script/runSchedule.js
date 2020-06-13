let colors = require('./colors')
let command = require('./command')
let schedule = require(`${process.argv[2]}`)
let moment = require('moment')

let scheduleObject = {
  run: command.run,
  runAsync: command.runAsync,
  spawn: command.spawn,
  colors,
  time: moment(process.argv[3]),
}
if (process.env.SMOL_CORE && process.env.SMOL_CORE != 'smol') {
  scheduleObject.core = {
    name: process.env.SMOL_CORE,
    coreConfig: config(process.env.SMOL_CORE),
    corePath: `${process.cwd()}/core/${process.env.SMOL_CORE}`,
  }
}

schedule.exec(scheduleObject)
