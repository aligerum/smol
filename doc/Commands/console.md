# console Command

smol provides an interactive console by running `smol console`. This console uses node's built-in REPL server. You may access the console by running `smol console`.

# Console History

The last 30 commands are stored in the project's history file. By default, this is located at `storage/console/history`. You may change this location by changing `historyPath` in `config/smol.json`.

# Core Functions

Upon starting the console, each of the project's Cores are started up and provided within the console by name. For example, if you create an `express` core called `api` and a `vue` core called `pwa`, you can access the express core's functions, controllers, etc. within the provided `api` object and access the vue core's functions, pages, etc. within the provided `pwa` object.

See each Core Type's documentation regarding their console integration.

# Plugins

Plugins can also provide functionality by name. For example, the `smol-plugin-user` plugin will be available as `user` within the console.

# Global Packages

The `smol` package and any packages you have installed via `npm` within your project are also available globally, just by accessing them by name. For example, if you install `moment`, you can immediately begin using it by running `moment()` rather than having to first run `const moment = require('moment')`.

Each package is named as camelCase, so the package `smol-core-express` is available `smolCoreExpress` within the console.

# await Keyword

For convenience, the console provides experimental `await` keyword support, meaning you may run asynchronous functions synchronously at the top level. For example, both of these work:

```js
let user
User.find(1).then(model => user = model)

let user = await User.find(1)
```
