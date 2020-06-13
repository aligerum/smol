# Plugins

`smol` provides a plugin system for adding functionality to multiple parts of a project. Plugins can provide additional functions, schedules, commands, and directly integrate with cores by responding to plugin "hooks", which are essentially prompts provided by cores for plugins to provide functionality.

Similarly to cores, plugins can be added to your project through npm. Any package starting with `smol-plugin` will be loaded as a plugin.

Plugins can be added to specific cores by using `smol plugin add <pluginName> <coreName>`. To remove the plugin from the core, use `smol plugin remove <pluginName> <coreName>`.

A list of available plugins can be shown by running `smol help plugin`.

See each plugins individual documentation for information about how the plugin affects cores and any added functionality it provides.
