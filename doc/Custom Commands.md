# Custom Commands

For this documentation, we'll create a custom greet command from scratch. (Note that the command we make will be identical to the one provided by running `smol make command greet --example`, so you can skip to the end by just running that command.

# Creating the Command

First, run `smol make command greet`. This will create a `command/` directory and a `greet.js` file within it that looks like this:

```js
module.exports = {
  description: '',
  args: [
  ],
  argValues: {
  },
  helpItems: {
  },
  help: {
  },
  exec: async command => {
  },
}
```

Now let's fill in the description field. This will be a command that provides friendly greetings, so let's fill that in as "Provide a friendly greeting". Now let's run `smol help` to see our command in the listings:

```
Usage
  smol [command] [arguments] [options]

Custom Commands
  greet        Provide a friendly greeting
```

We can also run `smol help greet` to get information about how to use the command:

```
Usage
  smol greet

Description
  Provide a friendly greeting
```

# Basic Functionality (exec function)

Now let's make it do something. The `exec` function is called when someone runs `smol greet`. For now, let's just make it say "Hello" and run the command:

```js
exec: async command => {
  console.log('Hello')
}
```

```
$ smol greet
Hello
```

# Provide a Name (Arguments)

Now let's say we want to have it greet a person by name. For that, we'll need to define arguments. Let's make an argument called "name" that the user can provide. Then we can access that argument within our `exec` function.

```js
module.exports = {
  description: 'Provide a friendly greeting',
  args: [
    'name: Name of the person to greet',
  ],
  argValues: {
  },
  helpItems: {
  },
  help: {
  },
  exec: async command => {
    console.log(`Hello ${command.args.name}`)
  },
}
```

Now let's look at the new documentation for our command by running `smol help greet`:

```
Usage
  smol greet <name>

Description
  Provide a friendly greeting

Arguments
  name  Name of the person to greet
```

Now let's run it:

```
$ smol greet Alice
Hello Alice
$ smol greet "Alice Smith"
Hello Alice Smith
```

# Optionally Greet with a Smile (Options)

Now let's say we want to add some options for what to say. In this case, let's optionally show a smiley face:

```js
module.exports = {
  description: 'Provide a friendly greeting',
  args: [
    'name: Name of the person to greet',
    '--smile: Provide a friendly smile',
  ],
  argValues: {
  },
  helpItems: {
  },
  help: {
  },
  exec: async command => {
    let greeting = `Hello ${command.args.name}`
    if (command.args.smile) greeting += ' :)'
    console.log(greeting)
  },
}
```

```
$ smol help greet
Usage
  smol greet <name> [options]

Description
  Provide a friendly greeting

Arguments
  name     Name of the person to greet

Options
  --smile  Provide a friendly smile
```

```
$ smol greet Alice
Hello Alice
$ smol greet Alice --smile
Hello Alice :)
```

Note: You can provide additional lines of help by adding line breaks (`\n`) to argument and option descriptions. New lines will automatically be indented properly.

# Greet Based on Time (Option Types)

Now let's make it do a time-based greeting. For that, we'll provide a `--time` option the user can set as a string. String options have an `=` sign after their name.

```js
module.exports = {
  description: 'Provide a friendly greeting',
  args: [
    'name: Name of the person to greet',
    '--smile: Provide a friendly smile',
    '--time=: Time of day',
  ],
  argValues: {
  },
  helpItems: {
  },
  help: {
  },
  exec: async command => {
    let greeting = ''

    // handle time
    if (command.args.time) {
      greeting += `Good ${command.args.time}, `
    } else {
      greeting += 'Hello, '
    }

    // add name
    greeting += command.args.name

    // smile
    if (command.args.smile) greeting += ' :)'

    // output
    console.log(greeting)

  },
}
```

```
$ smol help greet
Usage
  smol greet <name> [options]

Description
  Provide a friendly greeting

Arguments
  name     Name of the person to greet

Options
  --smile  Provide a friendly smile
  --time   Time of day (string)
```

```
$ smol greet Alice
Hello, Alice
$ smol greet Alice --time=morning
Good morning, Alice
$ smol greet Alice --time=afternoon --smile
Good afternoon, Alice :)
```

# Preventing Weird Times of Day (Argument Values)

This is fine, but it's weird that they can type anything as `--time`, so they could type `smol greet Alice --time=bye` and it would say `Good bye, Alice`, which isn't a greeting at all. Let's lock it down to just a few valid values:

```js
args: [
  'name: Name of the person to greet',
  '--smile: Provide a friendly smile',
  '--time=morning,day,afternoon,evening: Time of day',
],
```

```
$ smol help greet
Usage
  smol greet <name> [options]

Description
  Provide a friendly greeting

Arguments
  name     Name of the person to greet

Options
  --smile  Provide a friendly smile
  --time   Time of day (string)
             morning, day, afternoon, evening
```

```
$ smol greet Alice --time=bye
bye is not a valid value for --time
```

This is fine, and those values (morning, day, afternoon, evening) are pretty self-explanatory. But what if you have values that need some explanation?

```js
module.exports = {
  description: 'Provide a friendly greeting',
  args: [
    'name: Name of the person to greet',
    '--smile: Provide a friendly smile',
    '--style=: Style of greeting',
    '--time=morning,day,afternoon,evening: Time of day',
  ],
  argValues: {
    style: [
      'normal: Normal greeting (default)',
      'cheery: Extra cheery greeting',
      'cockney: A less than accurate British greeting',
      'country: A warm southern greeting',
      'medieval: Outdated greeting in most circles',
    ]
  },
  helpItems: {
  },
  help: {
  },
  exec: async command => {
    let greeting = ''

    // handle time
    if (command.args.time) {
      greeting += `Good ${command.args.time}, `
    } else {
      greeting += 'Hello, '
    }

    // add name
    greeting += command.args.name

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

    // output
    console.log(greeting)

  },
}
```

```
$ smol help greet
Usage
  smol greet <name> [options]

Description
  Provide a friendly greeting

Arguments
  name     Name of the person to greet

Options
  --smile  Provide a friendly smile
  --style  Style of greeting (string)
             normal     Normal greeting (default)
             cheery     Extra cheery greeting
             cockney    A less-than-accurate British greeting
             country    A warm southern greeting
             medieval   Outdated greeting in most circles
  --time   Time of day (string)
             morning, day, afternoon, evening
```

```
$ smol greet Alice --style=country
Hello, Alice. How ya'll doin'?
```

# Making Things Shorter (Flags and Aliases)

It would be easier to type `smol greet Alice -s` than `smol greet Alice --smile`, so we can add an alias for it:

```js
args: [
  'name: Name of the person to greet',
  '-s,--smile: Provide a friendly smile',
  '--style=: Style of greeting',
  '--time=morning,day,afternoon,evening: Time of day',
],
```

Doing this, we don't have to change our code at all. Whether the user uses `-s` or `--smile`, it will be available as `command.args.smile`. Note that this only works for boolean options, as all single-character options (flags) must be boolean type.

Now let's go ahead and add another boolean value as a flag as an example. This code is truncated to show only the things that have changed:

```js
args: [
  'name: Name of the person to greet',
  '-l: Make the greeting extra loud',
  '-s,--smile: Provide a friendly smile',
  '--style=: Style of greeting',
  '--time=morning,day,afternoon,evening: Time of day',
],

// in the exec function
if (command.args.l) greeting = greeting.toUpperCase()
```

```
$ smol help greet
Usage
  smol greet <name> [options]

Description
  Provide a friendly greeting

Arguments
  name        Name of the person to greet

Options
  -l          Make the greeting extra loud
  -s,--smile  Provide a friendly smile
  --style     Style of greeting (string)
                normal     Normal greeting (default)
                cheery     Extra cheery greeting
                cockney    A less-than-accurate British greeting
                country    A warm southern greeting
                medieval   Outdated greeting in most circles
  --time      Time of day (string)
                morning, day, afternoon, evening
```

When we run this, we can collapse all of the flags together for convenience:

```
$ smol greet Alice -l --smile
HELLO, ALICE :)
$ smol greet Alice -l -s
HELLO, ALICE :)
$ smol greet Alice -ls
HELLO, ALICE :)
```

# Greeting Multiple People (Arrays)

Now what if we want to greet multiple people? We should be able to just put them in a list. You can make arguments or options arrays by adding a `+` to their name. For this example, we'll make the `name` argument an array called `names`.

```js
module.exports = {
  description: 'Provide a friendly greeting',
  args: [
    'names+: Name of the person to greet',
    '-l: Make the greeting extra loud',
    '-s,--smile: Provide a friendly smile',
    '--style=: Style of greeting',
    '--time=morning,day,afternoon,evening: Time of day',
  ],
  argValues: {
    style: [
      'normal: Normal greeting (default)',
      'cheery: Extra cheery greeting',
      'cockney: A less-than-accurate British greeting',
      'country: A warm southern greeting',
      'medieval: Outdated greeting in most circles',
    ]
  },
  helpItems: {
  },
  help: {
  },
  exec: async command => {

    // greet each person
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
      console.log(greeting)
    }

  },
}
```

```
$ smol help greet
Usage
  smol greet <names> [options]

Description
  Provide a friendly greeting

Arguments
  names       Name of the person to greet (array)

Options
  -l          Make the greeting extra loud
  -s,--smile  Provide a friendly smile
  --style     Style of greeting (string)
                normal     Normal greeting (default)
                cheery     Extra cheery greeting
                cockney    A less-than-accurate British greeting
                country    A warm southern greeting
                medieval   Outdated greeting in most circles
  --time      Time of day (string)
                morning, day, afternoon, evening
```

```
$ smol greet Alice Bob Charlie
Hello, Alice
Hello, Bob
Hello, Charlie
```

Options can also be made arrays by adding `+` to their name, in which case you can define the option multiple times. For example, we could make a `--name+` option rather than an argument, and then you would run `smol greet --name=Alice --name=Bob --name=Charlie` and access it from `command.args.name`.

# Repeatedly Greeting (Numbers)

Flags can only be booleans, options are booleans by default, and arguments are strings by default. You can also make options and arguments numbers by adding a `#` to their name. Let's add a number of times to greet.

```js
args: [
  'names+: Name of the person to greet',
  '-l: Make the greeting extra loud',
  '--repeat#: Number of times to greet (default 1)',
  '-s,--smile: Provide a friendly smile',
  '--style=: Style of greeting',
  '--time=morning,day,afternoon,evening: Time of day',
],

// in the exec function
for (let i=0; i < (command.args.repeat || 1); i++) console.log(greeting)
```

```
$ smol help greet
Usage
  smol greet <names> [options]

Description
  Provide a friendly greeting

Arguments
  names       Name of the person to greet (array)

Options
  -l          Make the greeting extra loud
  --repeat    Number of times to greet (default 1) (number)
  -s,--smile  Provide a friendly smile
  --style     Style of greeting (string)
                normal     Normal greeting (default)
                cheery     Extra cheery greeting
                cockney    A less-than-accurate British greeting
                country    A warm southern greeting
                medieval   Outdated greeting in most circles
  --time      Time of day (string)
                morning, day, afternoon, evening
```

```
$ smol greet Alice --repeat=3
Hello, Alice
Hello, Alice
Hello, Alice
```

This could get out of hand if we allow any number, so we should make it so the number is less than say, 10.

```js
args: [
  'names+: Name of the person to greet',
  '-l: Make the greeting extra loud',
  '--repeat#=1-10: Number of times to greet (default 1)',
  '-s,--smile: Provide a friendly smile',
  '--style=: Style of greeting',
  '--time=morning,day,afternoon,evening: Time of day',
],
```

In this case, we specify it should be between 1 and 10 so no negative numbers are entered. You can define arguments and options to have ranges, be greater than, or less than numbers. For example: `--repeat#=1-10`, `--repeat#=>10`, `--repeat#=<10`.

# Optional Arguments and Required Options

By default, arguments are required and options are, well, optional. To make arguments required, add an `!` to their name. To make arguments optional, add a `?` to their name. Only non-boolean options can be required. Let's make names optional and style required.

```js
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

// greet each person
if (!command.args.names.length) command.args.names.push('you')
```

```
$ smol help greet
Usage
  smol greet [names] [options]

Description
  Provide a friendly greeting

Arguments
  names       Name of the person to greet (array, optional)

Options
  -l          Make the greeting extra loud
  --repeat    Number of times to greet (default 1) (number)
  -s,--smile  Provide a friendly smile
  --style     Style of greeting (string, required)
                normal     Normal greeting
                cheery     Extra cheery greeting
                cockney    A less-than-accurate British greeting
                country    A warm southern greeting
                medieval   Outdated greeting in most circles
  --time      Time of day (string)
                morning, day, afternoon, evening
```

```
$ smol greet Alice
Option --style is required
$ smol greet Alice --style=normal
Hello, Alice
$ smol greet --style=normal
Hello, you
```

# Working with Cores

We'll leave the greet example behind. For the rest of this documentation, we'll consider individual command examples.

If you would like to make a command that performs an action on a core within your project, you can add the `@` symbol to the argument or option's name. In this example, we'll run `du` to get the disk usage for a specific directory.

```
$ smol make command size
```

```js
// command/size.js
module.exports = {
  description: 'Get size of core',
  args: [
    'core@: Core to get size of'
  ],
  exec: async command => {
    console.log(`Size for ${command.args.core} (${command.info.core.type})`)
    command.run(`du -sh ${command.info.core.path}`)
  },
}
```

```
$ smol make core express api
Created express core at core/api
$ smol make core vue pwa
Created vue core at core/pwa
$ smol help size
Usage
  smol size <core>

Description
  Get size of core

Arguments
  core  Core to compress (core)
          api, web
$ smol size api
Size for api (express)
8.0K    /path/to/project/core/api
```

Setting an argument or option as a `core` by using `@` will automatically validate the input to be an existing core and add the available core names to the help command.

Core arguments and options are also available by name on the `command.info` object. For example, an argument `coreName@` will have info available for it at `command.info.coreName`. The info available:

| key | description | example |
| --- | --- | --- |
| path | path to core in project | /path/to/project/api |
| prototypePath | path to smol's core prototype files | /path/to/project/node_modules/smol-core-express |
| type | type of core | express |

You can also add `*` to argument and option names to make the argument a core type. This will validate inputs as one of the available core types (express, vue, mysql, etc.). Similarly to `@`, an `info` object will be available, but only `prototypePath` will be defined.

# Help Items and Sections

You can provide additional help items in a list by defining keys and values on the command's helpItems key. These items and descriptions will be in line with the other arguments and options provided by the help command.

You can also define text help sections with the `help` key. Line breaks will automatically be indented properly.

For example:

```
$ smol make command eat
```

```js
module.exports = {
  description: 'Have a snack',
  args: [
    'fruit: The fruit you would like to eat',
  ],
  argValues: {
  },
  help: {
    'Health Reminder': 'Fruit is very good for you.\nIt\'s also pretty inexpensive.',
    'Also Note': 'You can eat any of the fruit listed, or pick your own.',
  },
  helpItems: {
    'Fruit': [
      'apple: A juicy fruit',
      'lemon: A sour fruit',
      'raisin: A dried fruit',
    ],
  },
  exec: async command => {
    console.log(`You have eaten a delicious ${command.args.fruit}.`)
  },
}
```

```
$ smol help eat
Usage
  smol eat <fruit>

Description
  Have a snack

Arguments
  fruit   The fruit you would like to eat

Fruit
  apple   A juicy fruit
  lemon   A sour fruit
  raisin  A dried fruit

Health Reminder
  Fruit is very good for you.
  It's also pretty inexpensive.

Also Note
  You can eat any of the fruit listed, or pick your own.
```

# Command Colors

A `colors` object is available on the `command` object passed into the `exec` function that allows you to easily color command output. For example:

```js
exec: async command => {
  try {
    doSomething()
    console.log(command.colors.green('Success'))
  } catch (e) {
    console.log(command.colors.red(e))
  }
}
```

Available colors: `black`, `blue`, `cyan`, `green`, `magenta`, `red`, `yellow`, `white`.
Available styles: `bright`, `dim`, `underline`, `blink`, `reverse`, `hidden`.

Colors and styles can be mixed by putting the functions inside each other: `command.colors.red(command.colors.bright('Something went very wrong!'))`.

# Run, Spawn

Because it's a common need to run external programs from the command line, `run` and `spawn` function are provided. These are simply the `execSync` and `spawn` functions already provided by node's child_process object.

Use `command.run` to run external scripts synchronously. You can pass in and options object as the second argument in the same way you could pass it into `execSync`. For example, `command.run('mkdir -p some/path', {stdio: 'ignore'})`.

Use `command.spawn` to create a subprocess that runs independently of the main process (returns the subprocess object returned by `child_process.spawn`). Unlike `child_process.spawn`, you can pass in arguments as a single string, rather than an array. For example: `command.spawn('watch -n1 dmesg')`.

# Command Names

Command names are generally single values, but there are instances in which you might want to create multi-value names. For example, the `make` command has the normal `make`, but also has `make config` and `make core`. These are two separate commands that take different arguments. They're recognized by the first parts of the command the user inputs being `smol make config` or `smol make core`. The more specific commands are matched first.

To make a multi-value command name, use quotes or underscores, for example `smol make command do_stuff` and `smol make command "do stuff"` with both create `command/do_stuff.js` which will be called when you run `smol do stuff`.

Having multi-value commands is useful for avoiding conflicts with existing commands and for adding custom arguments and options for specific commands.
