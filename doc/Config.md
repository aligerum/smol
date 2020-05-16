# Config

Configuration files are in json format and are stored in config/. Each core has its own configuration by name (for example, if you have an express core called "api", it will pull its configuration from `config/api.json`).

To generate the config files during deployment or development, run `smol make config` (see make config command documentation).

You also have a configuration for the project for common things like app name, development mode, etc. that are stored in `config/smol.json`.

# Custom Config

Your project will also need project-specific configuration. Any files placed in `template/` that end in `config.json` are considered config files and will be copied into `config/` when you run `smol make config`.

For example, let's make a system that has a theme.config.json.


template/theme.config.json:

```json
{
  "backgroundColor": "white",
  "buttonColor": "red",
  "textColor": "black"
}
```

Now, if you run `smol make config`, this will copy this template into `config/theme.config.json` which you can then edit for this specific deployment without affecting version control.

# Accessing Config

To access configuration data, use `smol.config(configName)` function. Example, if you were to create the above theme configuration, you can access it with `let themeConfig = smol.config('theme')`.

Using a function like this rather than directly requiring the file allows smol to fall back to the default configuration file if none is present.
