const fs = require('fs')

module.exports = () => {
  let plugins = []
  if (fs.existsSync('package.json')) {
    let packageJson = require(`${process.cwd()}/package.json`)
    for (let jsonKey of ['dependencies', 'devDependencies']) {
      if (packageJson[jsonKey]) {
        plugins = plugins.concat(Object.keys(packageJson[jsonKey]).filter(key => key.startsWith('smol-plugin-')).map(key => {
          return {name: key.slice(12), path: packageJson[jsonKey][key]}
        }))
      }
    }
    for (let plugin of plugins) {
      if (plugin.path.slice(0, 1) == '.') plugin.path = `${process.cwd()}/${plugin.path}`
      if (plugin.path.slice(0, 1) != '/' && plugin.path.slice(1, 2) != ':') plugin.path = `${process.cwd()}/node_modules/${plugin.path}`
      let pluginJson = require(`${plugin.path}/plugin.json`)
      plugin.description = pluginJson.description
    }
  }
  return plugins
}
