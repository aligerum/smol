const fs = require('fs')

module.exports = () => {
  let plugins = []
  if (fs.existsSync('package.json')) {
    let packageJson = require(`${process.cwd()}/package.json`)
    for (let jsonKey of ['dependencies', 'devDependencies']) {
      if (packageJson[jsonKey]) {
        plugins = plugins.concat(Object.keys(packageJson[jsonKey]).filter(key => key.startsWith('smol-plugin-')).map(key => {
          return {name: key.slice(12), path: `${process.cwd()}/node_modules/${key}`}
        }))
      }
    }
    for (let plugin of plugins) {
      let pluginJson = require(`${plugin.path}/plugin.json`)
      plugin.description = pluginJson.description
    }
  }
  return plugins
}
