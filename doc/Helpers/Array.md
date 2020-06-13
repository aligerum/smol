# Array Helper

`smol.array` provides array functions:

| Method | Description |
| --- | --- |
| async asyncMap(array, callback) | Replace each item in the array by running async callback (async version of array.map()) |
| common(arrayA, arrayB) | Return all items that appear in both arrayA and arrayB |
| includesAll(array, items) | Return true if the array includes all items from the items array |
| includesAny(array, items) | Return true if the array includes any items from the items array |
| random(array) | Get random item from the array |
| remove(array, item) | Remove all instances of item from array |
| unique(array) | Filter down to only the first instance of each item in the array |
| uniqueKey(array, key) | Ensure each object in the array has a unique value for `key`, filtering to only the first instance of each unique value |

# To and From Object

`smol.array.toObject(array)` and `smol.array.fromObject(object)` allow conversion between array and object.

```js
let object = smol.array.toObject(['apple', 'pear', 'banana'])
console.log(object) // {apple: true, pear: true, banana: true}
let array = smol.array.fromObject({
  cat: true,
  dog: true,
  bird: false,
})
console.log(array) // ['cat', 'dog']
```
