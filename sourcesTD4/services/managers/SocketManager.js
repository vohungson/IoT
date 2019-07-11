const Utils = require('../ObjectUtils')

function SocketManager () {
    this.sockets = []
}

SocketManager.prototype.addSocket = function (socketId, socket) {
    var doesContain = false
    this.sockets.forEach(function (storedSocket, indexId) {
        if (indexId === socketId) {
            doesContain = true
        }
    })

    if (doesContain) {
        return
    }

    this.sockets[socketId] = socket
}

SocketManager.prototype.getSocket = function (socketId) {
    return this.sockets[socketId]
}

module.exports = SocketManager
