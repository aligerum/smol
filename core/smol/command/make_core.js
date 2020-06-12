const fs = require('fs')

module.exports = {
  description: 'Make a new core',
  args: [
    `type*: Type of core to make`,
    'name: Name for new core',
  ],
  exec: async command => {

    // don't overwrite existing cores
    if (fs.existsSync(`${process.cwd()}/core/${command.args.name}`)) {
      console.log(command.colors.yellow(`Core ${command.args.name} already exists`))
      process.exit(1)
    }

    // create directory
    command.run(`mkdir -p ${process.cwd()}/core/${command.args.name}`)

    // add skeleton
    if (fs.existsSync(`${command.info.type.prototypePath}/skeleton`)) command.run(`cp -R ${command.info.type.prototypePath}/skeleton/. ${process.cwd()}/core/${command.args.name}`)

    // create core json
    let jsonPath = `${process.cwd()}/core/${command.args.name}/core.json`
    let json = fs.existsSync(jsonPath) ? require(jsonPath) : {}
    json.type = command.args.type
    json.description = ''
    json.plugins = []
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2))

    // create config for core
    command.run(`smol make config ${command.args.name}`)

    // output
    console.log(command.colors.green(`Created ${command.args.type} core at core/${command.args.name}`))

    // run add script
    if (fs.existsSync(`${command.info.type.prototypePath}/add.js`)) {
      process.env.SMOL_CORE = command.args.name
      let add = require(`${command.info.type.prototypePath}/add.js`)
      add.exec()
    }

  }
}
