# generate key Command

When using smol's encryption functions, a global app encryption key is used by default (stored in config/smol.json). This key will need to be recorded as it is required to decrypt any data encrypted by the app.

To generate this key randomly, run `smol generate key`. If an encryption key is already defined in the config, it will not overwrite it. To force overwriting the existing key, use `smol generate key --force`.
