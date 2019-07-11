const Constants = require('./Constants.js')
const FileSystem = require('fs')

function Config () {
}

var configData = FileSystem.readFileSync(Constants.PATH_CONFIG_FILE)
var jsonConfig = JSON.parse(configData)

Config.getConfig = function (configName) {
    return jsonConfig[configName]
}

module.exports = Config
