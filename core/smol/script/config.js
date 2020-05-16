let fs = require('fs')

// get config by name
module.exports = name => {
  if (!name) name = 'smol'
  let paths = [`${process.cwd()}/config/${name}.json`, `${process.cwd()}/template/${name}.config.json`]
  if (fs.existsSync(`${process.cwd()}/core/${name}`)) {
    let coreJson = require(`${process.cwd()}/core/${name}/core.json`)
    let configPath = `${__dirname}/../../${coreJson.type}/template/config.json`
    if (fs.existsSync(configPath)) paths.push(configPath)
  }
  for (let path of paths) if (fs.existsSync(path)) return require(path)
}
