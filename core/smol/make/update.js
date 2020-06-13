const string = require('../script/string')

module.exports = {
  description: 'Update script',
  files: [
    {
      from: 'update.js',
      to: filename => `update/${filename}.js`,
    },
  ],
}
