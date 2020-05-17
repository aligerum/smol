const fs = require('fs')
const path = require('path')

module.exports = {
  description: 'Initialize smol app',
  args: [
    'path?: Path to directory to create. default: current directory',
    'editor?: If specified, open directory in this editor. ex: atom',
  ],
  exec: async command => {

    // image
    let image = fs.readFileSync(`${__dirname}/../data/smol.ans`, 'utf-8')
    console.log(`\n${image}\n`)

    // create directory
    let relativePath = command.args.path || '.'
    let displayPath = path.normalize(`${process.cwd()}/${relativePath}`)
    console.log(`Creating project at ${displayPath}...`)
    if (command.args.path) command.run(`mkdir -p ${command.args.path}`, {stdio: 'ignore'})

    // init npm package
    if (!fs.existsSync(`${relativePath}/package.json`)) {
      console.log('Initializing npm package...')
      command.run(`cd ${relativePath} && npm init -y`, {stdio: 'ignore'})
    }

    // init git
    if (!fs.existsSync(`${relativePath}/.git`)) {
      console.log('Initializing git repo...')
      command.run('git init', {stdio: 'ignore'})
    }

    // create .gitignore
    if (!fs.existsSync(`${relativePath}/.gitignore`)) command.run(`touch ${relativePath}/.gitignore`)
    let ignores = ['/config', '/storage']
    let gitignore = fs.readFileSync(`${relativePath}/.gitignore`, 'utf-8')
    for (let ignore of ignores) if (!gitignore.split('\n').includes(ignore)) gitignore += (gitignore.length && gitignore.slice(-1) != '\n') ? `\n${ignore}` : ignore
    if (gitignore.slice(-1) != '\n') gitignore += '\n'
    fs.writeFileSync(`${relativePath}/.gitignore`, gitignore)

    // install smol
    let package = fs.existsSync(`${relativePath}/package.json`) ? JSON.parse(fs.readFileSync(`${relativePath}/package.json`, 'utf-8')) : {}
    let dependencies = []
    if (package.dependencies) dependencies = dependencies.concat(Object.keys(package.dependencies))
    if (package.devDependencies) dependencies = dependencies.concat(Object.keys(package.devDependencies))
    if (!dependencies.includes('smol')) {
      console.log('Installing smol...')
      command.run(`cd ${relativePath} && npm i github:aligerum/smol`, {stdio: 'ignore'})
    }

    // success
    console.log(command.colors.green('Created a very smol project'))

    // open in editor
    if (command.args.editor) command.spawn(`${command.args.editor} ${relativePath}`)

  },
}
