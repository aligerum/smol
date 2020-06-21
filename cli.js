#!/usr/bin/env node
const execSync = require('child_process').execSync
let command = `node --no-warnings --experimental-repl-await ${__dirname}/cliChild.js ${process.argv.slice(2).map(arg => "'" + arg.replace(/'/g, "'\\''") + "'").join(' ')}`
try { execSync(command, {stdio: 'inherit'}) }
catch (err) { process.exit(1) }
