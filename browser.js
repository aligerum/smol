module.exports = {
  array: require('./core/smol/script/array'),
  color: require('./core/smol/script/color'),
  colors: require('./core/smol/script/colors'),
  coreJson: require('./core/smol/script/coreJson'),
  coreName: process.env.SMOL_CORE,
  request: require('./core/smol/script/request'),
  string: require('./core/smol/script/string'),
}
