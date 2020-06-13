module.exports = {

  // convert a hex value to an rgba() string for use in css
  opacify(hex, opacity) {

    // remove leading #
    if (hex[0] == '#') hex = hex.slice(1)

    // convert from 3-character string (#fff)
    if (hex.length == 3) hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`

    // get color channels
    let r = parseInt(`0x${hex.slice(0, 2)}`, 16)
    let g = parseInt(`0x${hex.slice(2, 4)}`, 16)
    let b = parseInt(`0x${hex.slice(4, 6)}`, 16)

    // return opacity
    return `rgba(${r}, ${g}, ${b}, ${opacity})`

  }

}
