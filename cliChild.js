#!/usr/bin/env node

const fs = require('fs')
const colors = require('./core/smol/script/colors')
const command = require('./core/smol/script/command')

// show unhanded rejections and exit
process.on('unhandledRejection', error => {
  console.log(error)
  process.exit(1)
})

let exit = async () => {
  console.log(colors.yellow('Not a valid smol app directory. Use ') + colors.white('smol init') + colors.yellow(' to create a new smol app.\n'))
  await command.exec(['help', 'init'])
  process.exit(1)
}

let run = async () => {

  // determine arguments
  let args = process.argv.slice(2)
  if (!args.length) args.push('help')

  // ensure cwd is a valid app directory
  if (args[0] != 'init') {
    let packagePath = `${process.cwd()}/package.json`
    let package = fs.existsSync(packagePath) ? require(packagePath) : null
    if (!package) await exit()
    let dependencies = []
    if (package.dependencies) dependencies = dependencies.concat(Object.keys(package.dependencies))
    if (package.devDependencies) dependencies = dependencies.concat(Object.keys(package.devDependencies))
    if (!dependencies.includes('smol')) await exit()
  }

  // run command
  command.exec(args)

}

run()
