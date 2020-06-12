# Cores

smol's main functionality such as commands, schedules, config, etc. is provided by the `smol` package. Extra functionality is broken up into separate packages called "cores".

# Installing and Creating Cores

New core types are installed through npm. For example, install the Express core by running `npm i --save github:aligerum/smol-core-express`. smol automatically detects cores by looking in package.json for anything that starts with `smol-core`.

Once the core is installed, you can make as many instances of that core as you want. For example, let's say we need a public api for this app to be used by other companies, and an internal api used by our employees. We could decide to just name these `publicApi` and `privateApi`. To create them, we would run `smol make core express publicApi` and `smol make core express privateApi`.

You could then install the mysql core by running `npm i --save aligerum/smol-core-mysql`. We could then create separate databases by running `smol make core mysql appDb` and `smol make core userDataDb`.

# Config

Each core has its own config which will be placed in `config/`. For example, by creating the above cores, we will automatically generate `publicApi.json`, `privateApi.json`, `appDb.json`, and `userDataDb.json` within `config/`. You may then set configuration on these files such as the database connection details for the databases, and the port and url for the apis.

# Core Data

Each core's individual data will be stored in `core/<coreName>/`. For example, Express controllers would be stored in `core/publicApi/controller`. See each individual core's documentation for information on where that core's files go. Many files are automatically placed by running `make` commands. See each core's documentation for available `make` templates.
