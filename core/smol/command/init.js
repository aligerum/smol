const fs = require('fs')

module.exports = {
  description: 'Initialize smol app',
  args: [
    'path?: Path to directory to create. default: current directory',
    'editor?: If specified, open directory in this editor. ex: atom',
  ],
  exec: async command => {

    // create directory
    if (command.args.path) command.run(`mkdir -p ${command.args.path}`, {stdio: 'ignore'})
    let path = command.args.path || '.'

    // init npm package
    if (!fs.existsSync(`${path}/package.json`)) command.run(`cd ${path} && npm init -y`, {stdio: 'ignore'})

    // install smol
    let package = fs.existsSync(`${path}/package.json`) ? JSON.parse(fs.readFileSync(`${path}/package.json`, 'utf-8')) : {}
    let dependencies = []
    if (package.dependencies) dependencies = dependencies.concat(Object.keys(package.dependencies))
    if (package.devDependencies) dependencies = dependencies.concat(Object.keys(package.devDependencies))
    if (!dependencies.includes('smol')) command.run(`cd ${path} && npm i github:aligerum/smol`, {stdio: 'ignore'})

    // init git
    if (!fs.existsSync(`${path}/.git`)) command.run('git init', {stdio: 'ignore'})

    // create .gitignore
    if (!fs.existsSync(`${path}/.gitignore`)) command.run(`touch ${path}/.gitignore`)
    let ignores = ['/config', '/storage']
    let gitignore = fs.readFileSync(`${path}/.gitignore`, 'utf-8')
    for (let ignore of ignores) if (!gitignore.split('\n').includes(ignore)) gitignore += (gitignore.length && gitignore.slice(-1) != '\n') ? `\n${ignore}` : ignore
    if (gitignore.slice(-1) != '\n') gitignore += '\n'
    fs.writeFileSync(`${path}/.gitignore`, gitignore)

    // success
    let phrases = [
      'Created a very smol project 🐈',
      'Your very smol project is here 🐈',
      'A very smol project has appeared 🐈',
      'The project you have created is very smol 🐈',
      'If you look closely, you will see a very smol project here 🐈',
      'A very new, very smol project has been made 🐈',
    ]
    console.log(command.colors.green(phrases[Math.floor(Math.random()*phrases.length)]))

    // open in editor
    if (command.args.editor) command.spawn(`${command.args.editor} ${path}`)

  },
}
