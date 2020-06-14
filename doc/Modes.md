# Maintenance Mode

When performing certain operations on the app, you may want to take the app down for maintenance. This will prevent normal operations of the app from occurring while important updates are happening.

For instance, when updating the code or database, you don't want users attempting to store data.

While the app is in Maintenance Mode, the following effects are in place:

- Schedules will not be run automatically, unless the schedule definition explicitly sets `allowInMaintenanceMode` to true (see Schedule doc).

See each core/plugin's documentation for additional maintenance mode effects.

# Production and Development Mode

You can set the overall mode of the app by setting the `mode` key in `config/smol.json`. This can either be "production" or "development". Development mode should only be used during local development.

Development mode generally runs slower, loads up debugging functions, shows detailed error output that could compromise security in the case of showing stack traces publicly, and when building assets for distribution, will avoid minification and optimization of code for faster builds.
