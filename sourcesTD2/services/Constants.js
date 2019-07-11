const path = require('path')

function Constants () {
}

var configPath = path.join(__dirname, '..', '..', 'resources', 'config', 'config.json')
Constants.PATH_CONFIG_FILE = configPath

module.exports = Constants
