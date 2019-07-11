const Utils = require('../../services/ObjectUtils')
const Client = require('../../data-models/Client')

function ClientManager (serverSocket) {
    this.connectClients = []
    this.serverSocket = serverSocket
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

ClientManager.prototype.addClient = function (socketId, nickname) {
    this.connectClients[this.connectClients.length > 0? this.connectClients.length : 0] = new Client(
        socketId,
        nickname
    )
}

ClientManager.prototype.removeClient = function (removedClient) {
    this.connectClients = this.connectClients.filter(function (client) {
        return client.id !== removedClient.id
    })
}

ClientManager.prototype.cleanupClients = function () {
    this.connectClients = this.connectClients.filter(function (client) {
        return !Utils.isEmpty(client)
    })
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
};

module.exports = ClientManager
