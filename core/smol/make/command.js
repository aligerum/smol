const string = require('../script/string')

module.exports = {
  description: 'smol command',
  files: [
    {
      from: 'command.js',
      fromExample: 'command.example.js',
      to: filename => `command/${filename.replace(/ /g, '_')}.js`,
    },
    {
      from: 'command.md',
      to: filename => `doc/Commands/${filename.replace(/ /g, '_')}.md`,
      parse: template => {
        return string.replace(template.content, {
          commandName: template.filename.replace(/ /g, '_')
        })
      },
    }
  ],
}
