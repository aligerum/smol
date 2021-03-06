const commandScript = require('../script/command')
const fs = require('fs')

// get core types and names
let coreTypes = commandScript.corePrototypes.map(type => `${type.name}: ${type.description}`)
let cores = commandScript.corePrototypes.map(type => type.name)

// get plugins
let plugins = commandScript.plugins.map(plugin => plugin.name)

module.exports = {
  args: [
    'command?+: Command to show help for',
  ],
  description: 'Show help for app or command',
  exec: async command => {

    // if just running `smol help`, show all commands
    if (!command.args.command.length || (command.args.command.length == 1 && cores.concat(plugins).includes(command.args.command[0]))) {
      let core
      let plugin
      if (cores.includes(command.args.command[0])) core = command.args.command[0]
      else if (plugins.includes(command.args.command[0])) plugin = command.args.command[0]
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
        let corePrototype = commandScript.corePrototypes.find(def => def.name == core)
        getCommands(`${corePrototype.description} Core (${corePrototype.name})`, `${corePrototype.path}/command`)
      } else if (plugin) {
        let pluginPrototype = commandScript.plugins.find(def => def.name == plugin)
        getCommands(`${pluginPrototype.description} Plugin (${pluginPrototype.name})`, `${pluginPrototype.path}/command`)
      } else {
        getCommands('Commands', __dirname)
        getCommands('Custom Commands', `${process.cwd()}/command`)
        for (let core of commandScript.corePrototypes) getCommands(`${core.description} Core (${core.name})`, `${core.path}/command`)
        for (let plugin of commandScript.plugins) getCommands(`${plugin.description} Plugin (${plugin.name})`, `${plugin.path}/command`)
      }
      let commandNameLength = commandGroups.map(commandGroup => commandGroup.paths).flat().map(path => path.split('/').slice(-1)[0].slice(0, -3)).reduce((a, b) => a.length > b.length ? a : b).length
      for (let commandGroup of commandGroups) {
        for (let path of commandGroup.paths) require(path)
      }
      console.log(command.colors.yellow('Usage'))
      if (core) console.log(`  smol <${core}Core> [command] [arguments] [options]`)
      else if (plugin) console.log(`  smol ${plugin} [command] [arguments] [options]`)
      else console.log('  smol [command] [arguments] [options]')
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
    let plugin
    if (command.args.command.length > 1 && cores.includes(command.args.command[0])) {
      core = command.args.command[0]
      command.args.command = command.args.command.slice(1).join('_')
      let path = `${commandScript.corePrototypes.find(type => type.name == core).path}/command/${command.args.command}.js`
      if (fs.existsSync(path)) commandDef = require(path)
    } else if (command.args.command.length > 1 && plugins.includes(command.args.command[0])) {
      plugin = command.args.command[0]
      command.args.command = command.args.command.slice(1).join('_')
      let path = `${commandScript.plugins.find(type => type.name == plugin).path}/command/${command.args.command}.js`
      if (fs.existsSync(path)) commandDef = require(path)
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
    else if (plugin) usage += `${plugin} `
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
        let addedLines = []
        if (arg.description) {
          let lines = arg.description.split('\n')
          line += lines.shift()
          if (lines.length) addedLines = lines
        }
        let tags = []
        if (arg.type != 'string') tags.push(arg.type)
        if (!arg.isRequired) tags.push('optional')
        if (tags.length) line += arg.description ? ` (${tags.join(', ')})` : `(${tags.join(', ')})`
        if (addedLines.length) addedLines.forEach(addedLine => line += `\n${' '.repeat(argNameLength)}    ${addedLine}`)
        if (arg.allowedValues && arg.allowedValues.length) {
          if (['core', 'coreType'].includes(arg.type) || (commandDef.argValues && commandDef.argValues[arg.name])) {
            let values
            if (arg.type == 'core') {
              values = arg.allowedValues.map(coreName => {
                let coreJson = require(`${process.cwd()}/core/${coreName}/core.json`)
                return `${coreName}: ${coreJson.description || commandScript.corePrototypes.find(type => type.name == coreJson.type).description}`
              })
            } else if (arg.type == 'coreType') {
              values = coreTypes
            } else {
              values = commandDef.argValues[arg.name]
            }
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
        let addedLines = []
        if (option.isFlag && option.alias) line += command.colors.green(`-${option.name},--${option.alias}`.padEnd(argNameLength, ' '))
        else if (option.isFlag) line += command.colors.green(`-${option.name}`.padEnd(argNameLength, ' '))
        else line += command.colors.green(`--${option.name}`.padEnd(argNameLength, ' '))
        line += '  '
        if (option.description) {
          let lines = option.description.split('\n')
          line += lines.shift()
          if (lines.length) addedLines = lines
        }
        let tags = []
        if (option.type != 'boolean') tags.push(option.type)
        if (option.isRequired) tags.push('required')
        if (tags.length) line += option.description ? ` (${tags.join(', ')})` : `(${tags.join(', ')})`
        if (addedLines.length) addedLines.forEach(addedLine => line += `\n${' '.repeat(argNameLength)}    ${addedLine}`)
        if (option.allowedValues && option.allowedValues.length) {
          if (['core', 'coreType'].includes(option.type) || (commandDef.argValues && commandDef.argValues[option.name])) {
            let values
            if (option.type == 'core') {
              values = option.allowedValues.map(coreName => {
                let coreJson = require(`${process.cwd()}/core/${coreName}/core.json`)
                return `${coreName}: ${coreJson.description || commandScript.corePrototypes.find(type => type.name == coreJson.type).description}`
              })
            } else if (option.type == 'coreType') {
              values = coreTypes
            } else {
              values = commandDef.argValues[option.name]
            }
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
