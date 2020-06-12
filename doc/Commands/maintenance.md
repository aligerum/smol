# maintenance Command

The `maintenance` command allows you conveniently turn maintenance mode on and off without having to edit the config.

Use `smol maintenance down` to put the app down for maintenance, `smol maintenance up` to bring the app back up. To check the current status, run `smol maintenance status`.

Maintenance mode is taken into consideration by many different parts of the app. For a quick list of the effects, run `smol help maintenance`. Each core and plugin provides help related to maintenance mode. For a full explanation, see the Maintenance Mode doc for smol and for each individual core/plugin.
