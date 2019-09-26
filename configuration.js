const cosmiconfig = require('cosmiconfig')
const result = cosmiconfig('overlayer').searchSync(process.env.HOME)
if (!result) console.warn('No ~/.overlayerrc.json configuration found')
const config = (result && result.config) || {}
module.exports = config
