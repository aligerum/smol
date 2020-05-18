# make config Command

To create all missing unversioned config files for the project, run `smol make config`.

This will create the main smol.json, any project specific configs (any files that end in ".config.json" in projectRoot/template/), and a named config for each of the project's cores.

To make a specific config file, you can provide the name. For example, to create just the config for a core named 'api', you would use `smol make config api`, or if you have a file named `template/project.config.json`, you can create this file by running `smol make config project`.

# Overwriting

By default, new files will not overwrite existing files. To force files to be overwritten, add `--force` or `-f` to the command.

# Editing Files

Obviously, the first thing you'll want to do when creating a new file from a template is start editing it. You can set the command to launch your editor in `config/smol.json`, then you can pass `--edit` or `-e` to the make command to automatically open the newly created files in your editor.

Since your editor preference is, itself, pulled from config, you can set this preference first by running `smol make config smol`, then setting the editor preference, then running `smol make config --edit` to create and edit the rest.
