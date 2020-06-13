module.exports = {

  // go through list passing items to callback function with n active at a time
  async forEach(list, n, callback) {

    // resolve if nothing to do
    if (!list.length) return Promise.resolve()

    return new Promise((resolve, reject) => {

      // copy list so can mutate
      let itemsLeft = list.slice()

      // define async function to call
      let inProgress = 0
      let asyncCallback = async item => {
        try {
          await callback(item)
        } catch (err) {
          console.log(err)
        }
        inProgress--
        if (!inProgress && !itemsLeft.length) return resolve()
        startItems()
      }
      let startItems = () => {
        if (!itemsLeft.length || inProgress > n) return
        inProgress++
        asyncCallback(itemsLeft.shift())
      }

      // start items
      while (inProgress < n) {
        if (!itemsLeft.length) break
        startItems()
      }

    })

  }

}
