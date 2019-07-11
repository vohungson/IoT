const Utils = require('../services/ObjectUtils')
const md5 = require('md5')

function Client (socketId, nickName) {
    this.id = socketId
    this.clientId = md5(socketId)
    this.nickName = nickName
    this.bannedGroups = []
}

Client.prototype.addBannedGroup = function (group) {
    var doesExist = false
    this.bannedGroups.forEach(function (bannedGroupName) {
        if (bannedGroupName === group.groupName) {
            doesExist = true
        }
    })

    if (doesExist) {
        return
    }

    this.bannedGroups[this.bannedGroups.length > 0? this.bannedGroups.length : 0] = group.groupName
}

Client.prototype.removeBannedGroup = function (removedGroupName) {
    this.bannedGroups = this.bannedGroups.filter(function (groupName) {
        return groupName !== removedGroupName
    })
}

Client.prototype.isBanned = function (groupName) {
    if (Utils.isEmpty(groupName)) {
        return false
    }

    var isBanned = false
    this.bannedGroups.forEach(function (bannedGroupName) {
        if (bannedGroupName === groupName) {
            isBanned = true
        }
    })

    return isBanned
}

module.exports = Client
