const col = require('./OutputColors')
const execSync = require('child_process').execSync
const spawn = require('child_process').spawn
const fs = require('fs')
const readline = require('readline')
const util = require('util')

module.exports = class Command {

  // help description
  static description = 'No description provided'

  // prompt with a question
  async ask(question) {

    // create readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    // promisify readline question function
    rl.question[util.promisify.custom] = question => new Promise(resolve => rl.question(question, resolve))

    // ask question
    let answer = await util.promisify(rl.question)(`${question} `)
    rl.close()

    // return answer
    return answer

  }

  // ask for yes or y
  async confirm(question) {
    let answer = await this.ask(question)
    return ['yes', 'y'].includes(answer.toLowerCase())
  }

  // run a command as specified by arguments
  static async exec(args) {

    // create new command class
    if (!fs.existsSync(`platform/all/command/${args[0]}.js`)) return console.log(col.yellow(`Command "${args[0]}" not found`))
    const commandClass = require(`../command/${args[0]}`)
    let command = new commandClass

    // determine applicable signature
    let signatures = commandClass.signature
    if (typeof signatures == 'string') signatures = [signatures]
    let signature
    for (let sig of signatures) {
      let sigArgs = sig.split(' ').filter(arg => arg.indexOf('{') == -1)
      let isMatched = true
      for (let argNum in sigArgs) {
        if (sigArgs[argNum] != args[parseInt(argNum) + 1]) {
          isMatched = false
          break
        }
      }
      if (isMatched) {
        signature = sig
        break
      }
    }
    if (!signature) signature = signatures[signatures.length - 1]
    command.matchedSignature = signature

    // assign arguments and options
    let tokens = signature.split(' ').filter(token => token && token.indexOf('--') == -1)
    let optionTokens = signature.split(' ').filter(token => token.indexOf('--') != -1)
    let argArgs = args.slice(1).filter(arg => arg.indexOf('--') == -1)
    let optionArgs = args.slice(1).filter(arg => arg.indexOf('--') != -1)
    command.args = {}
    command.options = {}
    for (let arg of tokens) command.args[arg.replace(/[{}\+?]/g, '')] = arg.indexOf('+') != -1 ? [] : null
    for (let i in argArgs) {
      let token = tokens[i].replace(/[{}\?\+]/g, '')
      if (tokens[i].indexOf('+') != -1) {
        command.args[token] = argArgs.slice(i)
        break
      } else {
        command.args[token] = argArgs[i]
      }
    }
    for (let token of optionArgs) {
      token = token.replace(/[{}\-]/g, '')
      command.options[token] = true
    }

    // ensure required arguments are met
    for (let token of tokens) {
      let isRequired = token.indexOf('?') == -1
      token = token.replace(/[{}\?\+]/g, '')
      if (isRequired && !command.args[token]) return console.log(col.yellow(`Must provide "${token}" argument`))
    }

    // run command
    await command.exec()

  }

  // run a command
  run(command) {
    execSync(command, {stdio: 'inherit'})
  }

  // spawn a command to run separately from main process
  spawn(command) {
    let subprocess = spawn(command.split(' ')[0], command.split(' ').slice(1), {detached: true, stdio: 'ignore'})
    subprocess.unref()
  }

}
