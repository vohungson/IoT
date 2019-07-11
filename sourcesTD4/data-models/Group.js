const Utils = require('../services/ObjectUtils')

function Group (groupName, isPublic) {
    this.groupName = groupName
    this.clients = []
    this.isPublic = isPublic !== 0
}

Group.prototype.addClient = function(client) {
    if (Utils.isEmpty(client) || this.contains(client)) {
        return
    }

    this.clients[this.clients.length > 0? this.clients.length : 0] = client
}

Group.prototype.contains = function (client) {
    if (Utils.isEmpty(client)) {
        return false
    }

    var doesContain = false
    this.clients.forEach(function (tmpClient) {
        if (tmpClient.id === client.id) {
            doesContain = true
        }
    })

    return doesContain
}

Group.prototype.containsUser = function (nickname) {
    if (Utils.isEmpty(nickname)) {
        return false
    }

    var doesContain = false
    this.clients.forEach(function (tmpClient) {
        if (tmpClient.nickName === nickname) {
            doesContain = true
        }
    })

    return doesContain
}

Group.prototype.removeClient = function(nickname) {
    this.clients = this.clients.filter(function (client) {
        return client.nickName !== nickname
    })
}

module.exports = Group
