const Message = require('../data-models/Message')
const Utils = require('../services/ObjectUtils')
const SocketUtils = require('../services/SocketUtils')

function ErrorHandler () {
}

ErrorHandler.onServerError = function (sender, socket, error) {
    if (!Utils.isEmpty(socket)) {
        socket.emit('message', Message.getServerErrorMessage(sender, error.errorMessage))
    }

    console.error(error.errorMessage)
}

ErrorHandler.onServerError = function (sender, socket, error, isSecure) {
    if (!Utils.isEmpty(socket)) {
        SocketUtils.emit(socket, 'message', Message.getServerErrorMessage(sender, error.errorMessage), isSecure)
    }

    console.error(error.errorMessage)
}

module.exports = ErrorHandler
