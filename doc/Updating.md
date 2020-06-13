# Updating

smol provides an update mechanism to update the app when there are changes to the code. The update works by doing the following:

- The app enters maintenance mode (if not already)
- Files are updated from git
- New npm packages and installed and existing packages are updated
- New configs are generated, and existing configs are updated with any new keys
- Each core type's update functions are called on each core of that type
- Each plugin's update functions are called on each core with the plugin enabled
- Custom project update scripts are run
- The app exits maintenance mode (if was live before update)

To run an update, run `smol update`. To see a list of all effects updating will have (including cores, plugins, and custom scripts), run `smol help update`.

# Custom Update Scripts

Custom update scripts can be created by running `smol make update <scriptName>`. Update scripts are stored in `update/`. Let's say we want to record update times in `storage/update.log`.

```
$ smol make update logTime
Created update/logTime.js
```

```js
const moment = require('moment')
const fs = require('fs')

module.exports = {
  description: 'Log times updates complete',
  order: 0,
  exec: async update => {
    console.log(update.colors.yellow('Logging time...'))
    fs.appendFileSync('storage/update.log', moment.format('YYYY-MM-DD HH:mm:ss'))
  },
}
```

The description key is displayed when `smol help update` is called. The update object has the same `colors`, `run`, `runAsync`, and `spawn` properties that commands have (see Commands doc).

Be sure to throw errors if things don't go according to plan. This is picked up by the update command so it can abort attempting to run further scripts.

# Order

Custom scripts are run synchronously in alphabetical order. If you would like to alter the order, you can set order values on the update file definition. Higher values get called later. Any items with the same order value will be prioritized alphabetically.

To be sure the update scripts are being ordered properly, run `smol help update` to see the exact order.
