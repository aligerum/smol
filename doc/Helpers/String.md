# String Helper

`smol.string` provides string functions:

| Method | Description |
| --- | --- |
| camelCase(string) | Change string to camelCase |
| kabobCase(string) | Change string to kabob-case |
| snakeCase(string) | Change string to snake_case |
| spaceCase(string) | Change string to Space Case |
| studlyCase(string) | Change string to StudlyCase |

| Method | Description |
| --- | --- |
| endsWith(string, suffix) | Return true if the string ends with the suffix |
| generate(options) | Generate a random string (see below) |
| startsWith(string, prefix) | Return true if the string starts with the prefix |

# Random Strings

Use `smol.string.generate` to generate a random string. This is useful for password generation or creating slugs. You can define `options.length` and `options.chars` to determine the string's length (default 32), and available chars (as a string). Default available chars are: `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-=[],.!@#$%^&*()_+{}|:<>?~`.

If you want to generate a string safe for use as a filename, define `options.type = 'filename'`. This will only use alphanumeric characters. You can still define other options such as length while using this option.

# Slugs

You can convert any string into a url string for use as a slug by calling `smol.string.slug`.

```js
smol.string.slug('Some Article Title! (Part 20)') // outputs: some-article-title-part-20
```
