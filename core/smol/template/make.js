const smol = require('smol')

module.exports = {
  description: 'makeDescription',
  files: [
    {
      from: 'makeName.js',
      fromExample: 'makeName.example.js',
      to: filename => `files/${smol.string.camelCase(filename)}.js`,
      parse: template => {
        return smol.string.replace(template.content, {
          filename: template.filename,
        })
      },
    }
  ],
}
