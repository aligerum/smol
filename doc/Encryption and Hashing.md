# Encryption and Hashing

`smol.crypt` performs encryption and decryption, and `smol.hash` performs hash generation and comparison.

# Config

`config/smol.json`'s `encryptionKey` defines the encryption key to use for encrypting and decrypting. You may manually enter an encryption key or use `smol generate key` to automatically generate a random key.

Note that changing this key will mean you cannot use `smol.crypt` to decrypt the data previously encrypted using the old key without passing the old key in. This key does not affect hashes generated using `smol.hash` though.

# Encryption

Use `smol.crypt` to encrypt and decrypt string and objects. You can encrypt by calling `smol.crypt.encrypt('someData')`, then decrypt it by calling `smol.crypt.decrypt(someEncryptedData)`.

Objects may be passed directly in, which will first be converted to JSON. When decrypting the data, a JSON string is returned and must be converted into an object using JSON.parse(), or by passing in an option: `smol.crypt.decrypt(someEncryptedJSON, {parse: true})`.

By default, encryption and decryption will use the master key as defined in `smol.json`, but you may store additional keys in this file or elsewhere and use those. For example, you could migrate a bunch of data to a new key this way: `let oldData = smol.crypt.key(oldKey).decrypt(oldData); smol.crypt.encrypt(oldData)`.

You may also pass nothing to key to reset the key back to default.

# Hashing

For security purposes, passwords are stored as hashes rather than saving them as plain text. To do this, use `smol.hash.make('plainTextPassword')`. Then to determine if an input is the same as the hash, use `smol.hash.compare('plainTextPassword', hash)`.

These functions take time and are asynchronous, so you must either use `smol.hash.make('plainTextPassword').then()` or use `let hash = await smol.hash.make('plainTextPassword')`.

# MD5

You can also create md5 hashes using `smol.hash.md5('plainText')`.
