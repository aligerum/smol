# init Command

To initialize an existing directory, run `smol init` within the directory. This will do the following:

- run `npm init` if `package.json` does not exist
- install `smol` npm package if not present
- run `git init` if not already initialized
- create `.gitignore` to ignore unversioned directories such as `config/`
- create base config file

If you would like to also create the directory, you may enter the new path. Example: `smol init myProject`.

If you would like to then open the new directory in an editor, you may pass that as the last argument. For example, to create the directory, initialize the new directory as a smol project, then open it in Atom, run `smol init myProject atom`.
