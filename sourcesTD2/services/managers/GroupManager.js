const Utils = require('../ObjectUtils')
const Group = require('../../data-models/Group')
const Client = require('../../data-models/Client')

function GroupManager (clientManager) {
    this.groups = []
    this.clientManager = clientManager
}

GroupManager.prototype.addClient = function (socket, nickname, groupName) {
    var group = this.getGroup(groupName)

    if (Utils.isEmpty(group)) {
        return
    }

    group.addClient(new Client(socket, nickname))
}

GroupManager.prototype.addClient = function (client, groupName) {
    var group = this.getGroup(groupName)

    if (Utils.isEmpty(group)) {
        return
    }

    group.addClient(client)
}

GroupManager.prototype.getGroup = function (groupName) {
    var group = null
    this.groups.forEach(function (tmpGroup) {
        if (tmpGroup.groupName === groupName) {
            group = tmpGroup
        }
    })

    return group
}

GroupManager.prototype.containsGroup = function (groupName) {
    var group = this.getGroup(groupName)
    return !Utils.isEmpty(group)
}

GroupManager.prototype.addNewGroup = function (client, groupName, isPublic) {
    if (this.containsGroup(groupName)) {
        return
    }

    var newGroup = new Group(groupName, isPublic)
    newGroup.addClient(client)

    this.groups[this.groups.length > 0? this.groups.length : 0] = newGroup
}

GroupManager.prototype.removeGroup = function (removedGroup) {
    this.groups = this.groups.filter(function (group) {
        return group.groupName !== removedGroup.groupName
    })
}

GroupManager.prototype.getGroups = function (nickname) {
    var result = []
    this.groups.forEach(function (group) {
        if (group.containsUser(nickname) || group.isPublic) {
            result[result.length > 0? result.length : 0] = group
        }
    })

    return result
}

GroupManager.prototype.removeClientInAllGroups = function (nickname) {
    var groups = this.getGroups(nickname)
    if (Utils.isEmpty(groups)) {
        return
    }

    groups.forEach(function (group) {
        group.removeClient(nickname)
    })
}

GroupManager.prototype.removeClient = function (nickname, groupName) {
    var group = this.getGroup(groupName)
    if (Utils.isEmpty(group)) {
        return
    }

    group.removeClient(nickname)
}

GroupManager.prototype.banClient = function (nickname, groupName) {
    var client = this.clientManager.getClient(nickname)
    if (Utils.isEmpty(client)) {
        return
    }

    client.addBannedGroup(this.getGroup(groupName))
}

GroupManager.prototype.unbanClient = function (nickname, groupName) {
    var client = this.clientManager.getClient(nickname)
    if (Utils.isEmpty(client)) {
        return
    }

    client.removeBannedGroup(groupName)
}

module.exports = GroupManager
