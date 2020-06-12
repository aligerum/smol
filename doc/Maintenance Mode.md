# Maintenance Mode

When performing certain operations on the app, you may want to take the app down for maintenance. This will prevent normal operations of the app from occurring while important updates are happening.

For instance, when updating the code or database, you don't want users attempting to store data.

While the app is in Maintenance Mode, the following effects are in place:

- Schedules will not be run automatically, unless the schedule definition explicitly sets `allowInMaintenanceMode` to true (see Schedule doc).

See each core/plugin's documentation for additional maintenance mode effects.
