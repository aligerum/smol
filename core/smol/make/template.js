const string = require('../script/string')

module.exports = {
  description: 'Blank template file',
  files: [
    {
      to: filename => `template/${filename}`,
      parse: template => '',
    },
  ],
}
