const child_process = require('child_process')
const colors = require('./colors')
const config = require('./config')
const fs = require('fs')
const readline = require('readline')
const string = require('./string')
const util = require('util')

// determine core prototypes and plugins
let corePrototypes = []
let plugins = []
if (fs.existsSync('package.json')) {
  let packageJson = require(`${process.cwd()}/package.json`)
  for (let jsonKey of ['dependencies', 'devDependencies']) {
    if (packageJson[jsonKey]) {
      corePrototypes = corePrototypes.concat(Object.keys(packageJson[jsonKey]).filter(key => key.startsWith('smol-core-')).map(key => {
        return {name: key.slice(10), path: `${process.cwd()}/node_modules/${key}`}
      }))
      plugins = plugins.concat(Object.keys(packageJson[jsonKey]).filter(key => key.startsWith('smol-plugin-')).map(key => {
        return {name: key.slice(12), path: `${process.cwd()}/node_modules/${key}`}
      }))
    }
  }
  for (let corePrototype of corePrototypes) {
    let coreJson = require(`${corePrototype.path}/core.json`)
    corePrototype.description = coreJson.description
  }
  for (let plugin of plugins) {
    let pluginJson = require(`${plugin.path}/plugin.json`)
    plugin.description = pluginJson.description
  }
}

// run command
let exec = async args => {

  // determine core names
  let core = 'smol'
  let coreName = core
  let plugin
  if (plugins.find(def => def.name == args[0])) {
    plugin = args[0]
    args = args.slice(1)
  } else if (fs.existsSync(`${process.cwd()}/core`)) {
    let coreNames = fs.readdirSync(`${process.cwd()}/core`)
    if (coreNames.includes(args[0])) {
      let coreJson = require(`${process.cwd()}/core/${args[0]}/core.json`)
      coreName = args[0]
      core = coreJson.type
      args = args.slice(1)
      process.env.SMOL_CORE = coreName
    }
  }

  // load command definition
  let commandDef
  for (let i = 0; i < args.length; i++) {
    let commandName = args.slice(0, args.length - i).join('_')
    let paths = [
      `${process.cwd()}/command/${commandName}.js`,
    ]
    if (plugin) paths.push(`${plugins.find(def => def.name == plugin).path}/command/${commandName}.js`)
    else if (core == 'smol') paths.push(`${__dirname}/../command/${commandName}.js`)
    else paths.push(`${corePrototypes.find(type => type.name == core).path}/command/${commandName}.js`)
    for (let path of paths) {
      if (fs.existsSync(path)) {
        commandDef = require(path)
        break
      }
    }
    if (commandDef) {
      args = args.slice(args.length - i)
      break
    }
  }
  if (!commandDef) {
    console.log(colors.yellow(`Command "${args[0]}" not found`))
    process.exit(1)
  }

  // create command
  let command = {
    ask,
    colors,
    confirm,
    run,
    runAsync,
    spawn,
  }
  let argDefs = parseArguments(commandDef, args)
  if (argDefs.errors.length) {
    console.log(command.colors.yellow(argDefs.errors[0]))
    process.exit(1)
  }
  command.args = argDefs.values
  command.info = argDefs.info
  if (!plugin && coreName != 'smol') {
    command.core = {
      name: coreName,
      coreConfig: config(coreName),
      corePath: `${process.cwd()}/core/${coreName}`,
    }
  }

  // run command
  await commandDef.exec(command)

}

// parse arguments
let parseArguments = (commandDef, inputArgs) => {

  let commandDefArgs = commandDef.args || []
  let argDefs = {info: {}, values: {}, errors: []}
  let coreNames = []
  if (fs.existsSync(`${process.cwd()}/core`)) coreNames = fs.readdirSync(`${process.cwd()}/core`)

  // determine flags
  argDefs.flags = commandDefArgs.filter(arg => arg.match(/^\-[^\-]/)).map(arg => {
    let alias = arg.split(':')[0].split(',')[1]
    if (alias) alias = alias.replace(/\-/g, '')
    return {
      name: arg.split(':')[0].split(',')[0].replace('-', ''),
      description: arg.split(':').slice(1).join(':').trim(),
      type: 'boolean',
      isFlag: true,
      alias,
    }
  })
  if (inputArgs) {
    for (let argDef of argDefs.flags) {
      if (argDef.alias) argDefs.values[argDef.alias] = false
      else argDefs.values[argDef.name] = false
    }
    inputArgs.filter(arg => arg.match(/^\-[^\-]/)).map(arg => arg.replace('-', '')).join('').split('').forEach(arg => {
      if (!argDefs.flags.map(arg => arg.name).includes(arg)) {
        argDefs.errors.push(`Unknown option: -${arg}`)
        return argDefs
      }
      let argDef = argDefs.flags.find(flag => flag.name == arg && flag.alias)
      if (argDef) argDefs.values[argDef.alias] = true
      else argDefs.values[arg] = true
    })
    inputArgs = inputArgs.filter(arg => !arg.match(/^\-[^\-]/))
  }

  // determine options
  argDefs.options = commandDefArgs.filter(arg => arg.match(/\-\-/)).map(arg => {
    if (arg.match(/^-.,/,)) arg = arg.slice(3)
    let def = arg.split(':')[0]
    let option = {
      name: def.split('=')[0].replace(/[\-\=\+\#\!\@\* ]/g, ''),
      description: (arg.split(':').slice(1).join(':') || '').trim(),
      type: 'boolean',
      isRequired: false,
      isOption: true,
    }
    if (def.match('=')) option.type = 'string'
    if (def.match(/\+/)) option.type = 'array'
    if (def.match('#')) option.type = 'number'
    if (def.match('@')) option.type = 'core'
    if (def.match(/\*/)) option.type = 'coreType'
    if (def.match('!') && option.type != 'boolean') option.isRequired = true
    if (commandDef.argValues && commandDef.argValues[option.name]) option.allowedValues = commandDef.argValues[option.name].map(value => value.split(':')[0])
    else if (option.type == 'core') option.allowedValues = coreNames
    else if (option.type == 'coreType') option.allowedValues = corePrototypes.map(type => type.name)
    else option.allowedValues = def.split('=')[1] ? def.split('=')[1].split(',') : []
    if (option.type == 'number') {
      let minMax = def.split('=')[1]
      if (minMax) {
        if (minMax.match('-')) {
          option.min = Number(minMax.split('-')[0])
          option.max = Number(minMax.split('-')[1])
        } else if (minMax.match('<')) {
          option.lessThan = Number(minMax.replace('<', ''))
        } else if (minMax.match('>')) {
          option.greaterThan = Number(minMax.replace('>', ''))
        }
        if (option.min == undefined && option.max == undefined && option.lessThan == undefined && option.greaterThan == undefined) option.allowedValues = option.allowedValues.map(value => Number(value))
        else option.allowedValues = []
      }
    }
    return option
  })
  if (inputArgs) {
    argDefs.options.forEach(option => {
      if (option.type == 'array') argDefs.values[option.name] = []
      if (option.type == 'boolean' && argDefs.values[option.name] == undefined) argDefs.values[option.name] = false
      if (['string', 'core'].includes(option.type)) argDefs.values[option.name] = ''
    })
    for (let i = 0; i < inputArgs.length; i++) {
      let arg = inputArgs[i]
      if (!arg.match(/^\-\-/)) continue
      let name = arg.split('=')[0].replace(/^\-\-/, '')
      let optionDef = argDefs.options.find(option => option.name == name)
      if (!optionDef) {
        argDefs.errors.push(`Unknown option: --${name}`)
        return argDefs
      }
      if (argDefs.values[name] && optionDef.type != 'array') {
        argDefs.errors.push(`Option --${name} specified multiple times`)
        return argDefs
      }
      let value = arg.split('=')[1]
      if (!value && optionDef.type != 'boolean') {
        if (!inputArgs[i] || inputArgs[i].match(/^\-/)) {
          argDefs.errors.push(`Value missing for option --${name}`)
          return argDefs
        }
        value = inputArgs[i]
        inputArgs.splice(i, 1)
      }
      if (optionDef.type == 'boolean') value = true
      if (optionDef.type == 'number') {
        value = Number(value)
        if (isNaN(value)) {
          argDefs.errors.push(`Option --${name} must be a number`)
          return argDefs
        }
        if (optionDef.min != undefined && value < optionDef.min) {
          argDefs.errors.push(`Option --${name} must be at least ${optionDef.min}`)
          return argDefs
        }
        if (optionDef.max != undefined && value > optionDef.max) {
          argDefs.errors.push(`Option --${name} must be at least ${optionDef.min}`)
          return argDefs
        }
        if (optionDef.lessThan != undefined && value >= optionDef.lessThan) {
          argDefs.errors.push(`Option --${name} must be less than ${optionDef.lessThan}`)
          return argDefs
        }
        if (optionDef.greaterThan != undefined && value <= optionDef.greaterThan) {
          argDefs.errors.push(`Option --${name} must be greater than ${optionDef.greaterThan}`)
          return argDefs
        }
      }
      if (optionDef.type == 'array') argDefs.values[name].push(value)
      else argDefs.values[name] = value
      if (optionDef.allowedValues.length && !optionDef.allowedValues.includes(value)) {
        if (optionDef.type == 'core') argDefs.errors.push(`Option --${name} must be a core`)
        else if (optionDef.type == 'coreType') argDefs.errors.push(`Option --${name} must be a core type`)
        else argDefs.errors.push(`${value} is not a valid value for --${name}`)
        return argDefs
      }
    }
    for (let option of argDefs.options) {
      if (!option.isRequired) continue
      if ((option.type != 'array' && [undefined, ''].includes(argDefs.values[option.name])) || (option.type == 'array' && !argDefs.values[option.name].length)) {
        argDefs.errors.push(`Option --${option.name} is required`)
        return argDefs
      }
    }
  }

  // determine arguments
  argDefs.arguments = commandDefArgs.filter(arg => !arg.match(/^\-/)).map(arg => {
    let def = arg.split(':')[0]
    let argDef = {
      name: def.split('=')[0].replace(/[\?\#\+\@\* ]/g, ''),
      description: arg.split(':').slice(1).join(':').trim(),
      type: 'string',
      isRequired: !arg.match(/\?/),
      isArgument: true,
    }
    if (def.match(/\+/)) argDef.type = 'array'
    if (def.match('#')) argDef.type = 'number'
    if (def.match('@')) argDef.type = 'core'
    if (def.match(/\*/)) argDef.type = 'coreType'
    if (commandDef.argValues && commandDef.argValues[argDef.name]) argDef.allowedValues = commandDef.argValues[argDef.name].map(value => value.split(':')[0])
    else if (argDef.type == 'core') argDef.allowedValues = coreNames
    else if (argDef.type == 'coreType') argDef.allowedValues = corePrototypes.map(type => type.name)
    else argDef.allowedValues = def.split('=')[1] ? def.split('=')[1].split(',') : []
    if (argDef.type == 'number') {
      let minMax = def.split('=')[1]
      if (minMax) {
        if (minMax.match('-')) {
          argDef.min = Number(minMax.split('-')[0])
          argDef.max = Number(minMax.split('-')[1])
        } else if (minMax.match('<')) {
          argDef.lessThan = Number(minMax.replace('<', ''))
        } else if (minMax.match('>')) {
          argDef.greaterThan = Number(minMax.replace('>', ''))
        }
        if (argDef.min == undefined && argDef.max == undefined && argDef.lessThan == undefined && argDef.greaterThan == undefined) argDef.allowedValues = argDef.allowedValues.map(value => Number(value))
        else argDef.allowedValues = []
      }
    }
    return argDef
  })
  if (inputArgs) {
    inputArgs = inputArgs.filter(arg => !arg.match(/^\-/))
    let requiredArgs = argDefs.arguments.filter(arg => arg.isRequired)
    if (inputArgs.length < requiredArgs.length) {
      argDefs.errors.push(`Missing required argument: ${requiredArgs[inputArgs.length].name}`)
      return argDefs
    }
    argDefs.arguments.forEach(argDef => {
      if (argDef.type == 'array') argDefs.values[argDef.name] = []
      if (['string', 'core'].includes(argDef.type)) argDefs.values[argDef.name] = ''
    })
    let activeArgs = []
    let optionalArgsLeft = inputArgs.length - requiredArgs.length
    for (let i=0; activeArgs.length < inputArgs.length && i < argDefs.arguments.length; i++) {
      let argumentDef = argDefs.arguments[i]
      if (!argumentDef) {
        argDefs.errors.push(`Unknown argument: ${inputArgs[i]}`)
        return argDefs
      }
      if (!argumentDef.isRequired) {
        if (!optionalArgsLeft) continue
        optionalArgsLeft--
      }
      activeArgs.push(argumentDef)
    }
    let activeArrayIndex
    for (let i=0; i < inputArgs.length; i++) {
      let value = inputArgs[i]
      let argumentDef
      if (activeArrayIndex != undefined) {
        if (inputArgs.length - i < activeArgs.length - activeArrayIndex) argumentDef = activeArgs[activeArgs.length - (inputArgs.length - i)]
        else argumentDef = activeArgs[activeArrayIndex]
      } else {
        argumentDef = activeArgs[i]
        if (argumentDef.type == 'array') activeArrayIndex = i
      }
      if (argumentDef.allowedValues.length && !argumentDef.allowedValues.includes(value)) {
        if (argumentDef.type == 'core') argDefs.errors.push(`Argument ${argumentDef.name} must be a core`)
        else if (argumentDef.type == 'coreType') argDefs.errors.push(`Argument ${argumentDef.name} must be a core type`)
        else argDefs.errors.push(`${value} is not a valid value for ${argumentDef.name}`)
        return argDefs
      }
      if (argumentDef.type == 'number') {
        value = Number(value)
        if (isNaN(value)) {
          argDefs.errors.push(`Argument ${argumentDef.name} must be a number`)
          return argDefs
        }
        if (argumentDef.min != undefined && value < argumentDef.min) {
          argDefs.errors.push(`Argument ${argumentDef.name} must be at least ${argumentDef.min}`)
          return argDefs
        }
        if (argumentDef.max != undefined && value > argumentDef.max) {
          argDefs.errors.push(`Argument ${argumentDef.name} must be at least ${argumentDef.min}`)
          return argDefs
        }
        if (argumentDef.lessThan != undefined && value >= argumentDef.lessThan) {
          argDefs.errors.push(`Argument ${argumentDef.name} must be less than ${argumentDef.lessThan}`)
          return argDefs
        }
        if (argumentDef.greaterThan != undefined && value <= argumentDef.greaterThan) {
          argDefs.errors.push(`Argument ${argumentDef.name} must be greater than ${argumentDef.greaterThan}`)
          return argDefs
        }
      }
      if (argumentDef.type == 'array') argDefs.values[argumentDef.name].push(value)
      else argDefs.values[argumentDef.name] = value
    }
  }

  // get info
  for (let argDef of argDefs.options.concat(argDefs.arguments)) {
    if (argDef.type == 'core' && argDefs.values[argDef.name]) {
      let corePath = `${process.cwd()}/core/${argDefs.values[argDef.name]}`
      let coreJson = require(`${corePath}/core.json`)
      argDefs.info[argDef.name] = {
        path: corePath,
        prototypePath: corePrototypes.find(corePrototype => corePrototype.name == coreJson.type).path,
        type: coreJson.type,
      }
    } else if (argDef.type == 'coreType' && argDefs.values[argDef.name]) {
      argDefs.info[argDef.name] = {
        prototypePath: corePrototypes.find(corePrototype => corePrototype.name == argDefs.values[argDef.name]).path,
      }
    }
  }

  // return argument definitions
  return argDefs

}

// prompt with a question
let ask = async question => {

  // create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  // promisify readline question function
  rl.question[util.promisify.custom] = question => new Promise(resolve => rl.question(question, resolve))

  // ask question
  let answer = await util.promisify(rl.question)(`${question} `)
  rl.close()

  // return answer
  return answer

}

// ask for yes or y
let confirm = async question => {
  let answer = await ask(question)
  return ['yes', 'y'].includes(answer.toLowerCase())
}

// run a command
let run = (command, options={stdio: 'inherit'}) => child_process.execSync(command, options)

// run a command asynchronously
let runAsync = async (command, options={stdio: 'inherit'}) => util.promisify(child_process.exec)(command, options)

// spawn a command to run separately from main process
let spawn = command => {
  let subprocess = child_process.spawn(command.split(' ')[0], command.split(' ').slice(1), {detached: true, stdio: 'ignore'})
  subprocess.unref()
  return subprocess
}

// export
module.exports = {
  ask,
  confirm,
  corePrototypes,
  exec,
  parseArguments,
  plugins,
  run,
  runAsync,
  spawn,
}
