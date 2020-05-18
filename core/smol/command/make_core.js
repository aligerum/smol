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

    // create core json
    let json = {
      type: command.args.type
    }
    fs.writeFileSync(`${process.cwd()}/core/${command.args.name}/core.json`, JSON.stringify(json, null, 2))

    // output
    console.log(command.colors.green(`Created ${command.args.type} core at core/${command.args.name}`))

  }
}
