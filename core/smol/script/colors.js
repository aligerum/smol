let codes = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underline: "\x1b[4m",

  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",

}

// wrap text in specific color
let wrap = (text, color, color2, color3, color4, color5) => {
  let colors = [color, color2, color3, color4, color5]
  if (typeof color == 'array') colors = color
  colors = colors.filter(item => item).map(item => codes[item]).join('')
  return `${colors}${text}${codes.reset}`
}

// wrap types
let bright = text => wrap(text, 'bright')
let dim = text => wrap(text, 'dim')
let underline = text => wrap(text, 'underline')
let blink = text => wrap(text, 'blink')
let reverse = text => wrap(text, 'reverse')
let hidden = text => wrap(text, 'hidden')

// wrap colors
let black = text => wrap(text, 'black')
let blue = text => wrap(text, 'blue')
let cyan = text => wrap(text, 'cyan')
let green = text => wrap(text, 'green')
let magenta = text => wrap(text, 'magenta')
let red = text => wrap(text, 'red')
let yellow = text => wrap(text, 'yellow')
let white = text => wrap(text, 'white')

module.exports = {
  wrap,
  bright,
  dim,
  underline,
  blink,
  reverse,
  hidden,
  black,
  blue,
  cyan,
  green,
  magenta,
  red,
  yellow,
  white,
}
