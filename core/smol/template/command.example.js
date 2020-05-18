module.exports = {
  description: 'Provide a friendly greeting',
  args: [
    'names+?: Name of the person to greet',
    '-l: Make the greeting extra loud',
    '--repeat#=1-10: Number of times to greet (default 1)',
    '-s,--smile: Provide a friendly smile',
    '--style!=: Style of greeting',
    '--time=morning,day,afternoon,evening: Time of day',
  ],
  argValues: {
    style: [
      'normal: Normal greeting',
      'cheery: Extra cheery greeting',
      'cockney: A less-than-accurate British greeting',
      'country: A warm southern greeting',
      'medieval: Outdated greeting in most circles',
    ]
  },
  help: {
  },
  helpItems: {
  },
  exec: async command => {

    // greet each person
    if (!command.args.names.length) command.args.names.push('you')
    for (let name of command.args.names) {
      let greeting = ''

      // handle time
      if (command.args.time) {
        greeting += `Good ${command.args.time}, `
      } else {
        greeting += 'Hello, '
      }

      // add name
      greeting += name

      // add style
      if (command.args.style && command.args.style != 'normal') {
        let greetings = {
          cheery: 'It\'s so good to see you!',
          cockney: 'How do ya do, gov\'nuh',
          country: 'How ya\'ll doin\'?',
          medieval: 'Well met.',
        }
        greeting += `. ${greetings[command.args.style]}`
      }

      // smile
      if (command.args.smile) greeting += ' :)'

      // loud
      if (command.args.l) greeting = greeting.toUpperCase()

      // output
      for (let i=0; i < (command.args.repeat || 1); i++) console.log(greeting)
      
    }

  },
}
