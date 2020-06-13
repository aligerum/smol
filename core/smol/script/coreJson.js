// get core config by name
module.exports = name => require(`${process.cwd()}/core/${name || process.env.SMOL_CORE}/core.json`)
