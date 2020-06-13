# smol.request

`smol.request.forEach(list, n, callback)` goes through each item in a list and passes them in ensuring n are active at all times until all are complete.

Example:

```js
let users = User.get()
await smol.request.forEach(users, 5, async user => {
  await axios.post(`user/${user.id}/push`)
})
```

This will start 5 immediately, then go through the entire list as each completes, ensuring 5 functions are always in progress.
