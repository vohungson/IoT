const Utils = require('../services/ObjectUtils')

function Client (socketId, nickName) {
    this.id = socketId
    this.nickName = nickName
    this.bannedGroups = []
}

Client.prototype.addBannedGroup = function (group) {
    var doesExist = false
    this.bannedGroups.forEach(function (bannedGroup) {
        if (bannedGroup.groupName === group.groupName) {
            doesExist = true
        }
    })

    if (doesExist) {
        return
    }

    this.bannedGroups[this.bannedGroups.length > 0? this.bannedGroups.length : 0] = group
}

Client.prototype.removeBannedGroup = function (groupName) {
    console.log('remove banned group')
    this.bannedGroups = this.bannedGroups.filter(function (group) {
        return group.groupName !== groupName
    })
}

Client.prototype.isBanned = function (groupName) {
    if (Utils.isEmpty(groupName)) {
        return false
    }

    var isBanned = false
    this.bannedGroups.forEach(function (bannedGroup) {
        if (bannedGroup.groupName === groupName) {
            isBanned = true
        }
    })

    return isBanned
}

module.exports = Client
