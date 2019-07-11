const Message = require('../data-models/Message')
const Utils = require('../services/ObjectUtils')

function ErrorHandler () {
}

ErrorHandler.onServerError = function (sender, socket, error) {
    if (!Utils.isEmpty(socket)) {
        socket.emit('message', Message.getServerErrorMessage(sender, error.errorMessage))
    }

    console.error(error.errorMessage)
}

module.exports = ErrorHandler
