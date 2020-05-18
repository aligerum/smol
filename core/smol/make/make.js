const string = require('../script/string')

module.exports = {
  description: 'smol make script',
  files: [
    {
      from: 'make.js',
      to: filename => `make/${filename}.js`,
      parse: template => {
        return string.replace(template.content, {
          makeName: template.filename,
          makeDescription: `${string.spaceCase(template.filename)} definition`,
        })
      },
    },
    {
      from: 'template.js',
      to: filename => `template/${filename}.js`,
    },
    {
      from: 'template.js',
      to: filename => `template/${filename}.example.js`,
    },
  ],
}
