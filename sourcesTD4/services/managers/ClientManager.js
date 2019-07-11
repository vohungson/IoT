const Utils = require('../../services/ObjectUtils')
const Client = require('../../data-models/Client')

function ClientManager (serverSocket, socketManager) {
    this.connectClients = []
    this.serverSocket = serverSocket
    this.socketManager = socketManager
}

ClientManager.prototype.containsNickName = function (nickName) {
    var client = null;
    this.connectClients.forEach(function (tmpClient) {
        if (tmpClient.nickName === nickName) {
            client = tmpClient
        }
    })

    return !Utils.isEmpty(client)
}

ClientManager.prototype.addClient = function (clientId, nickname) {
    this.connectClients[this.connectClients.length > 0? this.connectClients.length : 0] = new Client(
        clientId,
        nickname
    )
}

ClientManager.prototype.removeClient = function (removedClient) {
    if (Utils.isEmpty(removedClient)) {
        return
    }

    this.connectClients = this.connectClients.filter(function (client) {
        return client.id !== removedClient.id
    })
}

ClientManager.prototype.cleanupClients = function () {
    this.connectClients = this.connectClients.filter(function (client) {
        return !Utils.isEmpty(client)
    })
}

ClientManager.prototype.getClient = function (nickName) {
    if (Utils.isEmpty(nickName)) {
        return null
    }

    var client = null
    this.connectClients.forEach(function (tmpClient) {
        if (tmpClient.nickName === nickName) {
            client = tmpClient
        }
    })

    return client
}

ClientManager.prototype.getClientById = function (clientId) {
    var client = null
    this.connectClients.forEach(function (tmpClient) {
        if (tmpClient.id === clientId) {
            client = tmpClient
        }
    })

    return client
}

ClientManager.prototype.findSocketByNickName = function (nickName) {
    if (Utils.isEmpty(nickName)) {
        return null
    }

    var tmpClient = null;
    this.connectClients.forEach(function (client) {
        if (client.nickName === nickName) {
            tmpClient = client
        }
    })

    return !Utils.isEmpty(tmpClient)?
        this.serverSocket.sockets.connected[tmpClient.id] : null
}

ClientManager.prototype.findSocketByClientId = function (clientId, isSecure) {
    var client = null
    this.connectClients.forEach(function (tmpClient) {
        if (tmpClient.id === clientId) {
            client = tmpClient
        }
    })

    if (Utils.isEmpty(client)) {
        return null
    }

    if (!isSecure) {
        return this.serverSocket.sockets.connected[tmpClient.id]
    }
}

ClientManager.prototype.getAllClientSockets = function () {
    var clients = this.connectClients
    if (Utils.isEmpty(clients)) {
        return null
    }

    var result = []
    var socketManager = this.socketManager
    clients.forEach(function (client) {
        var socket = socketManager.getSocket(client.id)
        result[result.length > 0? result.length : 0] = socket
    })

    return result
}

ClientManager.prototype.getClientSockets = function (clients) {
    if (Utils.isEmpty(clients)) {
        return null
    }

    var result = []
    var socketManager = this.socketManager
    clients.forEach(function (client) {
        var socket = socketManager.getSocket(client.id)
        result[result.length > 0? result.length : 0] = socket
    })

    return result
}

module.exports = ClientManager
