const ObjectUtils = require('./ObjectUtils')

function SocketUtils () {
}

SocketUtils.emit = function (socket, channel, message, isSecure) {
    if (ObjectUtils.isEmpty(socket)) {
        return
    }

    if (!isSecure) {
        socket.emit(channel, message)
        return
    }

    if (socket.getFinished()) {
        socket.write(JSON.stringify(message))
    }
}

SocketUtils.broadcast = function (sockets, channel, group, message, isSecure) {
    if (ObjectUtils.isEmpty(sockets)) {
        return
    }

    if (!isSecure) {
        if (ObjectUtils.isEmpty(group)) {
            socket.broadcast.emit(channel, message)
            return
        }

        sockets[0].to(group.groupName).emit(channel, message)
        return
    }

    if (ObjectUtils.isEmpty(sockets)) {
        return
    }

    var emit = this.emit
    sockets.forEach(function (socket, socketId) {
        emit(socket, channel, message, isSecure)
    })
}

module.exports = SocketUtils
