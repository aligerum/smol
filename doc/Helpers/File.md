# smol.file

`smol.file` is used to store common file methods.

# Generate A Filename

To generate a random filename for a specific directory, call `smol.file.generateName` and pass in a `directory` option. This will return a random name that's available. You may also define an `extension` property to specify a required extension.

```js
let name = smol.file.generateName({directory: 'storage/test'})
// name: s28ul8ia6Gy8uckHtI4k0A6Y4tSCsqtU

name = smol.file.generateName({directory: 'storage/test', extension: 'txt'})
// name: MXLPSe5eJ9MIbsgFSAgVRkBSM05PxOxO.txt
```

# Move A File

When receiving a file within a controller, it's common to want to move the temporary file from its current location into a new location and give it a random filename. To generate the filename and move the file from the current location to the new location with the new name, use `smol.file.move`.

This also automatically creates all directories needed to store the file.

```js
// store a file named 'fileUpload' from request
handleFileUpload(req, res) {
  let filename = smol.file.move({
    fromPath: req.files.fileUpload.path,
    toDirectory: 'storage/files',
    extension: 'png',
  })
  // filename: kQ8Ti28ZeryZkJr7i2JHux1A6C0iTiQ5.png
}
```
