const execSync = require('child_process').execSync
const fs = require('fs')
const string = require('./string')

module.exports = {

  // generate random name in directory
  generateName(options = {}) {
    let dir = options.directory
    let name
    while (true) {
      name = string.generate({type: 'filename'})
      if (options.extension) name = `${name}.${options.extension}`
      if (!fs.existsSync(dir) || !fs.existsSync(`${dir}/${name}`)) break
    }
    return name
  },

  // generate new randomized name for file in directory
  move(options = {}) {
    let fromPath = options.fromPath
    let toDir = options.toDirectory
    let name = this.generateName({
      extension: options.extension,
      directory: toDir
    })
    execSync(`mkdir -p ${toDir}; mv ${fromPath} ${toDir}/${name}`)
    return name
  },

}
