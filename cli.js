#!/usr/bin/node --experimental-repl-await

const fs = require('fs')

// ensure cwd is valid app directory
let packagePath = `${process.cwd()}/package.json`
let package = fs.existsSync(packagePath) ? require(packagePath) : null
if (!package) return console.log('Not a valid smol app directory')
// let dependencies = []
// if (package.dependencies) dependencies = dependencies.concat(package.dependencies)
// if (package.devDependencies) dependencies = dependencies.concat(package.devDependencies)

console.log('yep')

// const Command = require('
