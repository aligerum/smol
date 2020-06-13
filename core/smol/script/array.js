module.exports = class ArrayHelper {

  // perform async map function
  static async asyncMap(array, callback) {
    for (let i in array) array[i] = await callback(array[i])
    return array
  }

  // return common items between a and b
  static common(arrayA, arrayB) {
    return arrayA.filter(item => arrayB.includes(item))
  }

  // return true if the array includes all of the input items
  static includesAll(array, items) {
    if (!Array.isArray(items)) items = [items]
    return items.filter(item => array.includes(item)).length == items.length
  }

  // return true if the array includes any of the input items
  static includesAny(array, items) {
    if (!Array.isArray(items)) items = [items]
    for (let item of items) if (array.includes(item)) return true
    return false
  }

  // get random item from array
  static random(array) {
    return array[Math.floor(Math.random() * array.length)]
  }

  // remove all instances of item from array
  static remove(array, item) {
    while (array.includes(item)) {
      array.splice(array.indexOf(item), 1)
    }
    return array
  }

  // convert an array to an object with keys = true for each item in the array
  static toObject(array) {
    let object = {}
    for (let key of array) object[key] = true
    return object
  }

  // convert an object into an array
  static fromObject(object) {
    let array = []
    for (let key in object) if (object[key]) array.push(key)
    return array
  }

  // filter to only first occurance of each item
  static unique(array) {
    return array.filter((item, index) => array.indexOf(item) == index)
  }

  // filter to only first occurance of each item with unique key
  static uniqueKey(array, key) {
    return array.filter((item, index) => !array.filter((second, secondIndex) => item[key] == second[key] && secondIndex < index).length)
  }

}
