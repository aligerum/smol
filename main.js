module.exports = {
  array: require('./core/smol/script/array'),
  color: require('./core/smol/script/color'),
  colors: require('./core/smol/script/colors'),
  coreJson: require('./core/smol/script/coreJson'),
  coreName: process.env.SMOL_CORE,
  config: require('./core/smol/script/config'),
  crypt: require('./core/smol/script/crypt'),
  file: require('./core/smol/script/file'),
  hook: require('./core/smol/script/hook'),
  plugins: require('./core/smol/script/plugins'),
  request: require('./core/smol/script/request'),
  string: require('./core/smol/script/string'),
}
