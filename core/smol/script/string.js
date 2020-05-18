// convert a string to camelCase
let camelCase = s => {
  s = studlyCase(s)
  return s.charAt(0).toLowerCase() + s.slice(1)
}

// return true if string ends with suffix
let endsWith = (s, suffix) => {
  return s.slice(-suffix.length) == suffix
}

// generate a random string
let generate = (options={}) => {

  // apply type
  if (options.type == 'filename') options.chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'

  // set default options
  if (!options.length) options.length = 32
  if (!options.chars) options.chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890-=[],.!@#$%^&*()_+{}|:<>?~'

  // generate string
  let chars = options.chars
  let s = ''
  while(s.length < options.length) s += chars.charAt(Math.floor(Math.random()*chars.length))

  // return generated string
  return s

}

// convert a string to kabob-case
let kabobCase = s => {
  return snakeCase(s).replace(/_/g, '-')
}

// replace items
let replace = (string, replacements={}) => {
  for (let regex in replacements) string = string.replace(new RegExp(regex, 'g'), replacements[regex])
  return string
}

// convert to slug
let slug = s => {
  return this.kabobCase(s.toLowerCase())
}

// convert a string to snake_case
let snakeCase = s => {
  s = s.replace(/[^a-zA-Z0-9\-_ ]/g, '').replace(/[\-_ ]/g, '_').replace(/[A-Z]/g, item => `_${item.toLowerCase()}`).replace(/_+/g, '_')
  if (s.charAt(0) == '_') s = s.slice(1)
  return s
}

// convert to Space Case
let spaceCase = s => {
  return snakeCase(s).split('_').map(item => `${item.charAt(0).toUpperCase()}${item.slice(1)}`).join(' ')
}

// returns true if string starts with a prefix
let startsWith = (s, prefix) => {
  return s.slice(0, prefix.length) == prefix
}

// convert a string to StudlyCase
let studlyCase = s => {
  return snakeCase(s).split('_').map(item => `${item.charAt(0).toUpperCase()}${item.slice(1)}`).join('')
}

module.exports = {
  camelCase,
  endsWith,
  kabobCase,
  replace,
  slug,
  snakeCase,
  spaceCase,
  startsWith,
  studlyCase,
}
