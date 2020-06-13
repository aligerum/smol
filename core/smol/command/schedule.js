const config = require('../script/config')
const moment = require('moment')
const fs = require('fs')
const scheduleScript = require('../script/schedule')
const string = require('../script/string')

// load config
let smolConfig = config()
if (!smolConfig.disabledSchedules) smolConfig.disabledSchedules = []
if (smolConfig.scheduleEnabled == undefined) smolConfig.scheduleEnabled = true

// get schedules
let schedules = []
if (fs.existsSync(`${process.cwd()}/schedule`)) fs.readdirSync(`${process.cwd()}/schedule`).forEach(path => schedules.push({name: path.split('.').slice(0, -1).join('.'), path: `${process.cwd()}/schedule/${path}`, def: require(`${process.cwd()}/schedule/${path}`), core: ''}))
if (fs.existsSync(`${process.cwd()}/core`)) {
  fs.readdirSync(`${process.cwd()}/core`).forEach(core => {
    if (fs.existsSync(`${process.cwd()}/core/${core}/schedule`)) fs.readdirSync(`${process.cwd()}/core/${core}/schedule`).forEach(path => schedules.push({name: path.split('.').slice(0, -1).join('.'), path: `${process.cwd()}/core/${core}/schedule/${path}`, def: require(`${process.cwd()}/core/${core}/schedule/${path}`), core}))
  })
}
for (let schedule of schedules) {
  schedule.displayName = string.spaceCase(schedule.name)
  schedule.displayDescription = schedule.def.description || 'No description provided'
  schedule.displayTime = string.spaceCase(schedule.def.time || 'every minute')
}
let scheduleNameLength = (schedules.length ? schedules.reduce((a, b) => a.displayName.length > b.displayName.length ? a : b).displayName.length : 4) || 4
let timeLength = (schedules.length ? schedules.reduce((a, b) => a.displayTime.length > b.displayTime.length ? a : b).displayTime.length : 4) || 4
let coreNameLength = (schedules.length ? schedules.reduce((a, b) => a.core.length > b.core.length ? a : b).core.length : 4) || 4

module.exports = {
  description: 'Perform scheduled actions',
  args: [
    'action: Action to perform',
    'schedule?: Name of individual schedule to run/enable/disable',
    '--time=: Time to simulate as a date string, ex: "2020-01-01 00:00:00"',
  ],
  help: {
    Notes: 'Calling run with no schedule specified calls all schedules respecting order/time/overlap/disabled/maintenanceMode\nCalling run on a specific schedule runs individual schedule regardless of time/overlap/disabled/maintenanceMode\nCalling enable/disable with no schedule specified enables/disables the scheduler itself',
  },
  argValues: {
    action: [
      'enable: Enable schedule',
      'disable: Disable schedule',
      'run: Run schedule',
      'status: Get status of schedule',
    ],
    schedule: schedules.map(schedule => `${schedule.name}: ${schedule.displayDescription}`),
  },
  exec: async command => {

    // status
    if (command.args.action == 'status') {
      if (smolConfig.scheduleEnabled) console.log(command.colors.green('Schedule system is enabled'))
      else console.log(command.colors.yellow('Schedule system is disabled'))
      if (command.args.schedule) {
        let schedule = schedules.find(schedule => schedule.name == command.args.schedule)
        let now = moment()
        let nextTime = scheduleScript.getNextTime(schedule.def.time, now)
        console.log(command.colors.dim(` ✓  ${'Name'.padEnd(scheduleNameLength, ' ')}  ${'Core'.padEnd(coreNameLength, ' ')}  ${'Time'.padEnd(timeLength, ' ')}  Next 10 Runs             Description`))
        let isEnabled = !(smolConfig.disabledSchedules && smolConfig.disabledSchedules.includes(schedule.name))
        console.log(` ${isEnabled ? '✓' : ' '}  ${schedule.displayName.padEnd(scheduleNameLength, ' ')}  ${schedule.core.padEnd(coreNameLength, ' ')}  ${schedule.displayTime.padEnd(timeLength, ' ')}  ${nextTime.format('ddd MMM')} ${nextTime.format('D').padStart(2, ' ')} ${nextTime.format('YYYY')} ${nextTime.format('h').padStart(2, ' ')}:${nextTime.format('mma')}  ${schedule.displayDescription}`)
        for (let i=0; i<9; i++) {
          nextTime = scheduleScript.getNextTime(schedules.find(schedule => schedule.name == command.args.schedule).def.time, nextTime)
          console.log(`    ${''.padEnd(scheduleNameLength, ' ')}  ${''.padEnd(coreNameLength, ' ')}  ${''.padEnd(timeLength, ' ')}  ${nextTime.format('ddd MMM')} ${nextTime.format('D').padStart(2, ' ')} ${nextTime.format('YYYY')} ${nextTime.format('h').padStart(2, ' ')}:${nextTime.format('mma')}`)
        }
      } else {
        if (!schedules.length) return console.log(`${smolConfig.appName} has no scheduled actions`)
        console.log(command.colors.dim(` ✓  ${'Name'.padEnd(scheduleNameLength, ' ')}  ${'Core'.padEnd(coreNameLength, ' ')}  ${'Time'.padEnd(timeLength, ' ')}  Next Run                 Description`))
        let now = moment()
        for (let schedule of schedules) {
          let nextTime = scheduleScript.getNextTime(schedule.def.time, now)
          let isEnabled = !(smolConfig.disabledSchedules && smolConfig.disabledSchedules.includes(schedule.name))
          console.log(` ${isEnabled ? '✓' : ' '}  ${schedule.displayName.padEnd(scheduleNameLength, ' ')}  ${schedule.core.padEnd(coreNameLength, ' ')}  ${schedule.displayTime.padEnd(timeLength, ' ')}  ${nextTime.format('ddd MMM')} ${nextTime.format('D').padStart(2, ' ')} ${nextTime.format('YYYY')} ${nextTime.format('h').padStart(2, ' ')}:${nextTime.format('mma')}  ${schedule.displayDescription}`)
        }
      }
    }

    // disable
    if (command.args.action == 'disable') {
      if (command.args.schedule) {
        if (!smolConfig.disabledSchedules.includes(command.args.schedule)) smolConfig.disabledSchedules.push(command.args.schedule)
        console.log(`Schedule "${command.args.schedule}" disabled`)
      } else {
        console.log('Schedule system disabled')
        smolConfig.scheduleEnabled = false
      }
      command.run(`mkdir -p ${process.cwd()}/config`)
      fs.writeFileSync(`${process.cwd()}/config/smol.json`, JSON.stringify(smolConfig, null, 2))
    }

    // enable
    if (command.args.action == 'enable') {
      if (command.args.schedule) {
        if (smolConfig.disabledSchedules.includes(command.args.schedule)) smolConfig.disabledSchedules.splice(smolConfig.disabledSchedules.indexOf(command.args.schedule), 1)
        console.log(command.colors.green(`Schedule "${command.args.schedule}" enabled`))
      } else {
        smolConfig.scheduleEnabled = true
        console.log(command.colors.green('Schedule system enabled'))
      }
      fs.writeFileSync(`${process.cwd()}/config/smol.json`, JSON.stringify(smolConfig, null, 2))
    }

    // run
    if (command.args.action == 'run') {

      // schedule disabled
      if (!command.args.schedule && !smolConfig.scheduleEnabled) return console.log(command.colors.yellow(`Schedule system is disabled`))

      // get time
      let time = command.args.time ? moment(command.args.time) : moment()

      // run specific order
      if (command.args.schedule) schedules = [schedules.find(schedule => schedule.name == command.args.schedule)]

      // group into orders
      let orders = []
      for (let schedule of schedules) {
        if (!orders[schedule.def.order]) orders[schedule.def.order] = []
        orders[schedule.def.order].push(schedule)
      }
      orders = orders.filter(order => order)

      // determine schedules for which it is time
      for (let order of orders) {
        let promises = []
        for (let schedule of order) {
          if (!command.args.schedule && smolConfig.maintenanceMode && !schedule.def.allowInMaintenanceMode) {
            console.log(command.colors.yellow(`Skipping ${schedule.name} (not allowed in maintenance mode) (${orders.flat().indexOf(schedule) + 1}/${orders.flat().length})`))
            continue
          }
          let isTime = (command.args.schedule && !command.args.time) ? true : scheduleScript.isTime(schedule.def.time, time)
          if (!isTime) continue
          let commandString = ''
          if (schedule.core) commandString += `SMOL_CORE=${schedule.core} `
          commandString += `node ${__dirname}/../script/runSchedule.js "${schedule.path}" "${time.format('YYYY-MM-DD HH:mm:ss')}"`
          if (fs.existsSync(`${smolConfig.runningSchedulePath}/${schedule.name}`) && command.run(`ps -eo pid`, {stdio: 'pipe'}).toString().match(fs.readFileSync(`${smolConfig.runningSchedulePath}/${schedule.name}`, 'utf-8')) && !schedule.def.canOverlap) {
            console.log(command.colors.yellow(`Skipping ${schedule.name} (overlap not allowed) (${orders.flat().indexOf(schedule) + 1}/${orders.flat().length})`))
            continue
          }
          console.log(command.colors.yellow(`Starting ${schedule.name}... (${orders.flat().indexOf(schedule) + 1}/${orders.flat().length})`))
          command.run(`mkdir -p ${smolConfig.runningSchedulePath}`)
          fs.writeFileSync(`${smolConfig.runningSchedulePath}/${schedule.name}`, `${process.pid}`)
          promises.push(new Promise(async (resolve, reject) => {
            try {
              await command.runAsync(commandString)
              command.run(`rm ${smolConfig.runningSchedulePath}/${schedule.name}`)
              console.log(command.colors.green(`Finished ${schedule.name}`))
            } catch (err) {
              console.log(command.colors.yellow(`Error in ${schedule.name}:`))
              console.log(err)
            }
            resolve()
          }))
        }
        await Promise.all(promises)
      }

    }

  },
}
