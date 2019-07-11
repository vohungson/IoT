const Utils = require('./ObjectUtils')
const Command = require('../data-models/Command')

function CommandParser () {
}

CommandParser.parse = function (commandString) {
    if (Utils.isEmpty(commandString)) {
        return null
    }

    var splitItems = commandString.split(';').map(function (item) {
        return item.trim()
    })

    var commandSymbol = splitItems.length > 0? splitItems[0] : null
    var commandType = Command.getCommandType(commandSymbol)

    var params = splitItems.length > 1? splitItems.slice(1) : null

    return commandType != null? new Command(commandType, params) : null
}

module.exports = CommandParser
