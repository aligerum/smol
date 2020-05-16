const commandScript = require('../script/command')
const fs = require('fs')

// get list of cores
let cores = fs.readdirSync(`${__dirname}/../..`).filter(core => core != 'smol')

module.exports = {
  args: [
    'command?+: Command to show help for',
  ],
  description: 'Show help for app or command',
  exec: async command => {

    // if just running `smol help`, show all commands
    if (!command.args.command.length || (command.args.command.length == 1 && cores.includes(command.args.command[0]))) {
      let core
      if (cores.includes(command.args.command[0])) core = command.args.command[0]
      console.log(command.colors.yellow('Usage'))
      if (core) console.log(`  smol <${core}Core> [command] [arguments] [options]`)
      else console.log('  smol [command] [arguments] [options]')
      let commandGroups = []
      let getCommands = (heading, dir) => {
        if (!fs.existsSync(dir)) return
        let commandGroup = {
          heading,
          paths: fs.readdirSync(dir).map(name => `${dir}/${name}`)
        }
        if (commandGroup.paths.length) commandGroups.push(commandGroup)
      }
      if (core) {
        getCommands(require(`${__dirname}/../../${core}/core.json`).description + ` (${core})`, `${__dirname}/../../${core}/command`)
      } else {
        getCommands('Commands', __dirname)
        getCommands('Custom Commands', `${process.cwd()}/command`)
        for (let core of cores) getCommands(require(`${__dirname}/../../${core}/core.json`).description + ` (${core})`, `${__dirname}/../../${core}/command`)
      }
      let commandNameLength = commandGroups.map(commandGroup => commandGroup.paths).flat().map(path => path.split('/').slice(-1)[0].slice(0, -3)).reduce((a, b) => a.length > b.length ? a : b).length
      for (let commandGroup of commandGroups) {
        console.log(command.colors.yellow(`\n${commandGroup.heading}`))
        for (let path of commandGroup.paths) {
          let commandDef = require(path)
          console.log(`  ${command.colors.green(path.split('/').slice(-1)[0].slice(0, -3).padEnd(commandNameLength, ' ').replace(/\_/, ' '))}  ${commandDef.description || 'No description provided'}`)
        }
      }
      return
    }

    // show help for specific command
    let commandDef
    let core
    if (command.args.command.length > 1 && cores.includes(command.args.command[0])) {
      core = command.args.command[0]
      command.args.command = command.args.command.slice(1).join('_')
      if (fs.existsSync(`${__dirname}/../../${core}/command/${command.args.command}.js`)) commandDef = require(`${__dirname}/../../${core}/command/${command.args.command}`)
    } else {
      command.args.command = command.args.command.join('_')
      if (fs.existsSync(`command/${command.args.command}.js`)) commandDef = require(`${process.cwd()}/command/${command.args.command}`)
      if (!commandDef && fs.existsSync(`${__dirname}/${command.args.command}.js`)) commandDef = require(`${__dirname}/${command.args.command}`)
    }
    if (!commandDef) {
      console.log(command.colors.yellow(`Command "${command.args.command.replace(/_/g, ' ')}" not found`))
      process.exit(1)
    }
    let argDefs = commandScript.parseArguments(commandDef)

    // show help
    let usage = `  smol `
    if (core) usage += `<${core}Core> `
    usage += command.args.command.replace(/_/, ' ')
    if (argDefs.arguments.length) for (let arg of argDefs.arguments) usage += ` ${arg.isRequired ? '<' + arg.name + '>': '[' + arg.name + ']'}`
    if (argDefs.flags.length || argDefs.options.length) usage += ` [options]`
    console.log(command.colors.yellow('Usage'))
    console.log(usage)

    // show description
    if (commandDef.description) {
      console.log(command.colors.yellow('\nDescription'))
      console.log(`  ${commandDef.description}`)
    }

    // show arguments
    let allArgNames = argDefs.arguments.map(arg => arg.name).concat(argDefs.flags.map(flag => flag.alias ? `-${flag.name},--${flag.alias}` : `-${flag.name}`)).concat(argDefs.options.map(option => `--${option.name}`))
    if (commandDef.helpItems) allArgNames = allArgNames.concat(Object.values(commandDef.helpItems).flat().map(line => line.split(':')[0]))
    let argNameLength = allArgNames.length ? allArgNames.reduce((a, b) => a.length > b.length ? a : b).length : 0
    let allValueNames = argDefs.arguments.concat(argDefs.options).concat(argDefs.flags).map(arg => arg.allowedValues || []).flat()
    let valNameLength = allValueNames.length ? allValueNames.reduce((a, b) => a.length > b.length ? a : b).length : 0
    if (argDefs.arguments.length) {
      console.log(command.colors.yellow('\nArguments'))
      for (let arg of argDefs.arguments) {
        let line = `  ${command.colors.green(arg.name.padEnd(argNameLength, ' '))}  `
        if (arg.description) line += arg.description
        let tags = []
        if (arg.type != 'string') tags.push(arg.type)
        if (!arg.isRequired) tags.push('optional')
        if (tags.length) line += arg.description ? ` (${tags.join(', ')})` : `(${tags.join(', ')})`
        if (arg.allowedValues && arg.allowedValues.length) {
          if (arg.type == 'coreType' || (commandDef.argValues && commandDef.argValues[arg.name])) {
            let values = arg.type == 'coreType' ? commandScript.coreTypes : commandDef.argValues[arg.name]
            for (let val of values) line += `\n  ${''.padEnd(argNameLength, ' ')}    ${command.colors.dim(val.split(':')[0].padEnd(valNameLength, ' '))}  ${(val.split(':')[1] || '').trim()}`
          } else {
            line += `\n  ${''.padEnd(argNameLength, ' ')}    ${arg.allowedValues.map(val => command.colors.dim(val)).join(', ')}`
          }
        }
        console.log(line)
      }
    }

    // show options
    let orderedOptions = argDefs.flags.concat(argDefs.options.filter(option => !argDefs.flags.find(flag => flag.alias == option.name))).sort((a, b) => {
      if ([a.name, b.name].sort()[0] == a.name) return -1
      return 1
    })
    if (orderedOptions.length) {
      console.log(command.colors.yellow('\nOptions'))
      for (let option of orderedOptions) {
        let line = '  '
        if (option.isFlag && option.alias) line += command.colors.green(`-${option.name},--${option.alias}`.padEnd(argNameLength, ' '))
        else if (option.isFlag) line += command.colors.green(`-${option.name}`.padEnd(argNameLength, ' '))
        else line += command.colors.green(`--${option.name}`.padEnd(argNameLength, ' '))
        line += '  '
        if (option.description) line += `${option.description}`
        let tags = []
        if (option.type != 'boolean') tags.push(option.type)
        if (option.isRequired) tags.push('required')
        if (tags.length) line += option.description ? ` (${tags.join(', ')})` : `(${tags.join(', ')})`
        if (option.allowedValues && option.allowedValues.length) {
          if (option.type == 'coreType' || (commandDef.argValues && commandDef.argValues[option.name])) {
            let values = option.type == 'coreType' ? commandScript.coreTypes : commandDef.argValues[option.name]
            for (let val of values) line += `\n  ${''.padEnd(argNameLength, ' ')}    ${command.colors.dim(val.split(':')[0].padEnd(valNameLength, ' '))}  ${(val.split(':')[1] || '').trim()}`
          } else {
            line += `\n  ${''.padEnd(argNameLength, ' ')}    ${option.allowedValues.map(val => command.colors.dim(val)).join(', ')}`
          }
        }
        console.log(line)
      }
    }

    // show custom help items
    if (commandDef.helpItems) {
      for (let sectionName in commandDef.helpItems) {
        if (!commandDef.helpItems[sectionName].length) continue
        console.log(`\n${command.colors.yellow(sectionName)}`)
        for (let sectionLine of commandDef.helpItems[sectionName]) console.log(`  ${command.colors.green(sectionLine.split(':')[0].padEnd(argNameLength, ' '))}  ${(sectionLine.split(':')[1] || '').trim()}`)
      }
    }

    // show custom help sections
    if (commandDef.help) {
      for (let sectionName in commandDef.help) {
        if (!commandDef.help[sectionName]) continue
        console.log(`\n${command.colors.yellow(sectionName)}`)
        console.log(`  ${commandDef.help[sectionName].replace(/\n/g, '\n  ')}`)
      }
    }

  },
}
