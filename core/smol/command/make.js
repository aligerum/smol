const commandScript = require('../script/command')
const config = require('../script/config')
const fs = require('fs')

// load make scripts from directory
let loadMakes = dir => {
  return fs.readdirSync(dir).map(fileName => {
    let make = require(`${dir}/${fileName}`)
    return `${fileName.slice(0, -3)}: ${make.description}`
  })
}

// determine help items
let helpItems = {}
helpItems.Templates = loadMakes(`${__dirname}/../make`)
if (fs.existsSync(`${process.cwd()}/make`)) helpItems['Custom Templates'] = loadMakes(`${process.cwd()}/make`)
for (let core of commandScript.corePrototypes) {
  if (fs.existsSync(`${core.path}/make`)) helpItems[`${core.description} (${core.name}) Templates`] = loadMakes(`${core.path}/make`)
}

// command definition
module.exports = {
  description: 'Make files from templates',
  args: [
    'core?@: Core to make file for',
    'template: Template to make file from (see templates)',
    'filename: New filename to create',
    '-e,--edit: Open newly created file in editor',
    '-f,--force: Overwrite file if it already exists',
    '-x,--example: Create file from example template if available',
  ],
  helpItems,
  exec: async command => {

    // get make
    let make
    let corePrototypePath
    let corePath = process.cwd()
    let paths = [`${__dirname}/..`, process.cwd()]
    if (command.args.core) {
      paths.push(command.info.core.prototypePath)
      corePath = command.info.core.path
    }
    for (let path of paths) {
      if (fs.existsSync(`${path}/make/${command.args.template}.js`)) {
        corePrototypePath = path
        make = require(`${path}/make/${command.args.template}`)
        break
      }
    }
    if (!make) {
      console.log(command.colors.yellow(`Make "${command.args.template}" not found`))
      process.exit(1)
    }

    // create files
    let files = []
    for (let file of make.files) {
      let from = file.from
      if (command.args.example && template.fromExample) from = file.fromExample
      let fileContents = ''
      if (fs.existsSync(`${corePrototypePath}/template/${from}`)) fileContents = fs.readFileSync(`${corePrototypePath}/template/${from}`, 'utf-8')
      if (file.parse) fileContents = file.parse({content: fileContents, filename: command.args.filename, isExample: command.args.example})
      let relativeTarget = file.to(command.args.filename)
      let target = `${corePath}/${relativeTarget}`
      let newFile = {
        isSkipped: false,
        isOverwritten: false,
        isExample: command.args.example && file.fromExample,
        name: command.args.core ? `core/${command.args.core}/${relativeTarget}` : relativeTarget,
        path: target,
      }
      files.push(newFile)
      if (fs.existsSync(target) && !command.args.force) {
        newFile.isSkipped = true
        continue
      }
      command.run(`mkdir -p ${target.split('/').slice(0, -1).join('/')}`)
      if (fs.existsSync(target)) newFile.isOverwritten = true
      fs.writeFileSync(target, fileContents)
    }
    for (let file of files) {
      let color = file.isSkipped ? 'yellow' : 'green'
      let line
      if (file.isSkipped) line = `Skipped ${file.name} (already exists)`
      else if (file.isOverwritten) line = `Overwrote ${file.name}`
      else line = `Created ${file.name}`
      if (file.isExample && !file.isSkipped) line += ' (from example)'
      console.log(command.colors[color](line))
    }

    // edit files
    if (command.args.edit) {
      for (let file of files) command.spawn(`${config().editor} ${file.path}`)
    }

  },
}
