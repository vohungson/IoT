const Utils = require('../services/ObjectUtils')
const Command = require('../data-models/Command')

function Message () {
}

Message.MESSAGE_TYPE_CLIENT_CONNECTION         = 'client-connection'
Message.MESSAGE_TYPE_CLIENT_AUTH               = 'client-authentication'
Message.MESSAGE_TYPE_CLIENT_BROADCAST          = 'client-broadcast'
Message.MESSAGE_TYPE_CLIENT_LIST_CLIENTS       = 'client-list-clients'
Message.MESSAGE_TYPE_CLIENT_QUIT               = 'client-quit'
Message.MESSAGE_TYPE_CLIENT_SEND               = 'client-send'
Message.MESSAGE_TYPE_CLIENT_CREATE_GROUP       = 'client-create-group'
Message.MESSAGE_TYPE_CLIENT_JOIN_GROUP         = 'client-join-group'
Message.MESSAGE_TYPE_CLIENT_BROADCAST_GROUP    = 'client-broadcast-group'
Message.MESSAGE_TYPE_CLIENT_LIST_GROUP_CLIENTS = 'client-list-group-clients'
Message.MESSAGE_TYPE_CLIENT_GROUP_MESSAGES     = 'client-group-messages'
Message.MESSAGE_TYPE_CLIENT_GROUPS             = 'client-groups'
Message.MESSAGE_TYPE_CLIENT_LEAVE_GROUP        = 'client-leave-group'
Message.MESSAGE_TYPE_CLIENT_INVITE_TO_GROUP    = 'client-invite-to-group'
Message.MESSAGE_TYPE_CLIENT_KICK_OUT_GROUP     = 'client-kick-group'
Message.MESSAGE_TYPE_CLIENT_GROUP_BAN          = 'client-group-ban'
Message.MESSAGE_TYPE_CLIENT_GROUP_UNBAN        = 'client-group-unban'
Message.MESSAGE_TYPE_CLIENT_GROUP_STATES       = 'client-group-states'

Message.MESSAGE_TYPE_SERVER_HELLO              = 'server-hello'
Message.MESSAGE_TYPE_SERVER_BROADCAST          = 'server-broadcast'
Message.MESSAGE_TYPE_SERVER_LIST_CLIENTS       = 'server-list-clients'
Message.MESSAGE_TYPE_SERVER_QUIT               = 'server-quit'
Message.MESSAGE_TYPE_SERVER_SEND               = 'server-send'
Message.MESSAGE_TYPE_SERVER_ERROR              = 'server-error'
Message.MESSAGE_TYPE_SERVER_CREATE_GROUP       = 'server-create-group'
Message.MESSAGE_TYPE_SERVER_JOIN_GROUP         = 'server-join-group'
Message.MESSAGE_TYPE_SERVER_BROADCAST_GROUP    = 'server-broadcast-group'
Message.MESSAGE_TYPE_SERVER_LIST_GROUP_CLIENTS = 'server-list-group-clients'
Message.MESSAGE_TYPE_SERVER_GROUP_MESSAGES     = 'server-group-messages'
Message.MESSAGE_TYPE_SERVER_GROUPS             = 'server-groups'
Message.MESSAGE_TYPE_SERVER_LEAVE_GROUP        = 'server-leave-group'
Message.MESSAGE_TYPE_SERVER_INVITE_TO_GROUP    = 'server-invite-to-group'
Message.MESSAGE_TYPE_SERVER_KICK_OUT_GROUP     = 'server-kick-group'
Message.MESSAGE_TYPE_SERVER_GROUP_BAN          = 'server-group-ban'
Message.MESSAGE_TYPE_SERVER_GROUP_UNBAN        = 'server-group-unban'
Message.MESSAGE_TYPE_SERVER_GROUP_STATES       = 'server-group-states'

Message.getConnectionMessage = function (senderName) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_CLIENT_CONNECTION
    }
}

Message.getAuthMessage = function (senderName, password) {
    return {
        sender: senderName,
        password: password,
        action: this.MESSAGE_TYPE_CLIENT_AUTH
    }
}

Message.getBroadcastMessage = function (senderName, msg) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_CLIENT_BROADCAST,
        msg: msg
    }
}

Message.getListClientsMessage = function (senderName) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_CLIENT_LIST_CLIENTS
    }
}

Message.getQuitMessage = function (senderName) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_CLIENT_QUIT
    }
}

Message.getSendMessage = function (senderName, receiverName, msg) {
    return {
        sender: senderName,
        dest: receiverName,
        action: this.MESSAGE_TYPE_CLIENT_SEND,
        msg: msg
    }
}

Message.getGroupCreateMessage = function (senderName, groupName, isPublic) {
    return {
        sender: senderName,
        group: groupName,
        isPublic: isPublic,
        action: this.MESSAGE_TYPE_CLIENT_CREATE_GROUP
    }
}

Message.getGroupJoinMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_JOIN_GROUP
    }
}

Message.getGroupBroadcastMessage = function (senderName, groupName, msg) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_BROADCAST_GROUP,
        msg: msg
    }
}

Message.getGroupMembersMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_LIST_GROUP_CLIENTS
    }
}

Message.getGroupMessagesMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_GROUP_MESSAGES
    }
}

Message.getGroupsMessage = function (senderName) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_CLIENT_GROUPS
    }
}

Message.getGroupLeaveMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_LEAVE_GROUP
    }
}

Message.getGroupInviteMessage = function (senderName, groupName, receiverName) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_INVITE_TO_GROUP
    }
}

Message.getGroupKickMessage = function (senderName, groupName, receiverName, reason) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        reason: reason,
        action: this.MESSAGE_TYPE_CLIENT_KICK_OUT_GROUP
    }
}

Message.getGroupBanMessage = function (senderName, groupName, receiverName, reason) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        reason: reason,
        action: this.MESSAGE_TYPE_CLIENT_GROUP_BAN
    }
}

Message.getGroupUnBanMessage = function (senderName, groupName, receiverName) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_GROUP_UNBAN
    }
}

Message.getGroupStatesMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_CLIENT_GROUP_STATES
    }
}

Message.getMessageByCommand = function (senderName, commandObject) {
    if (Utils.isEmpty(commandObject.commandType)) {
        return null
    }

    switch (commandObject.commandType) {
        case Command.COMMAND_TYPE_BROADCAST:
            var msg = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            return this.getBroadcastMessage(senderName, msg)

        case Command.COMMAND_TYPE_LIST_CLIENTS:
            return this.getListClientsMessage(senderName)

        case Command.COMMAND_TYPE_QUIT:
            return this.getQuitMessage(senderName)

        case Command.COMMAND_TYPE_SEND:
            var receiverName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            var msg = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 1?
                commandObject.params[1] : null
            return this.getSendMessage(senderName, receiverName, msg)

        case Command.COMMAND_TYPE_CREATE_GROUP:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            var isPublic = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 1?
                commandObject.params[1] : null
            isPublic = isPublic === '0'? 0 : 1;

            return this.getGroupCreateMessage(senderName, groupName, isPublic)

        case Command.COMMAND_TYPE_JOIN_GROUP:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            return this.getGroupJoinMessage(senderName, groupName)

        case Command.COMMAND_TYPE_BROADCAST_GROUP:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            var msg = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 1?
                commandObject.params[1] : null
            return this.getGroupBroadcastMessage(senderName, groupName, msg)

        case Command.COMMAND_TYPE_LIST_GROUP_CLIENTS:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            return this.getGroupMembersMessage(senderName, groupName)

        case Command.COMMAND_TYPE_GROUP_MESSAGES:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            return this.getGroupMessagesMessage(senderName, groupName)

        case Command.COMMAND_TYPE_GROUPS:
            return this.getGroupsMessage(senderName)

        case Command.COMMAND_TYPE_LEAVE_GROUP:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            return this.getGroupLeaveMessage(senderName, groupName)

        case Command.COMMAND_TYPE_INVITE_TO_GROUP:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            var dest = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 1?
                commandObject.params[1] : null
            return this.getGroupInviteMessage(senderName, groupName, dest)

        case Command.COMMAND_TYPE_KICK_OUT_GROUP:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            var dest = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 1?
                commandObject.params[1] : null
            var reason = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 2?
                commandObject.params[2] : null
            return this.getGroupKickMessage(senderName, groupName, dest, reason)

        case Command.COMMAND_TYPE_GROUP_BAN:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            var dest = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 1?
                commandObject.params[1] : null
            var reason = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 2?
                commandObject.params[2] : null
            return this.getGroupBanMessage(senderName, groupName, dest, reason)

        case Command.COMMAND_TYPE_GROUP_UNBAN:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            var dest = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 1?
                commandObject.params[1] : null
            return this.getGroupUnBanMessage(senderName, groupName, dest)

        case Command.COMMAND_TYPE_GROUP_STATES:
            var groupName = !Utils.isEmpty(commandObject.params) && commandObject.params.length > 0?
                commandObject.params[0] : null
            return this.getGroupStatesMessage(senderName, groupName)

        default:
            return null
    }
}

Message.getServerHelloMessage = function (senderName) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_SERVER_HELLO,
        msg: 'Hello ' + senderName
    }
}

Message.getServerErrorMessage = function (senderName, msg) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_SERVER_ERROR,
        msg: msg
    }
}

Message.getServerBroadcastMessage = function (senderName, msg) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_SERVER_BROADCAST,
        msg: msg
    }
}

Message.getServerListClientsMessage = function (senderName, clients) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_SERVER_LIST_CLIENTS,
        clients: clients
    }
}

Message.getServerQuitMessage = function (senderName, msg) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_SERVER_QUIT,
        msg: msg
    }
}

Message.getServerSendMessage = function (sender, dest, msg) {
    return {
        sender: sender,
        dest: dest,
        action: this.MESSAGE_TYPE_SERVER_SEND,
        msg: msg
    }
}

Message.getServerGroupCreateMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_CREATE_GROUP
    }
}

Message.getServerGroupJoinMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_JOIN_GROUP
    }
}

Message.getServerGroupBroadcastMessage = function (senderName, groupName, msg) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_BROADCAST_GROUP,
        msg: msg
    }
}

Message.getServerGroupMembersMessage = function (senderName, groupName, clients) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_LIST_GROUP_CLIENTS,
        clients: clients
    }
}

Message.getServerGroupMessagesMessage = function (senderName, groupName, messages) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_GROUP_MESSAGES,
        messages: messages
    }
}

Message.getServerGroupsMessage = function (senderName, groups) {
    return {
        sender: senderName,
        action: this.MESSAGE_TYPE_SERVER_GROUPS,
        groups: groups
    }
}

Message.getServerGroupLeaveMessage = function (senderName, groupName) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_LEAVE_GROUP
    }
}

Message.getServerGroupInviteMessage = function (senderName, groupName, receiverName) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_INVITE_TO_GROUP
    }
}

Message.getServerGroupKickMessage = function (senderName, groupName, receiverName, reason) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        reason: reason,
        action: this.MESSAGE_TYPE_SERVER_KICK_OUT_GROUP
    }
}

Message.getServerGroupBanMessage = function (senderName, groupName, receiverName, reason) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        reason: reason,
        action: this.MESSAGE_TYPE_SERVER_GROUP_BAN
    }
}

Message.getServerGroupUnBanMessage = function (senderName, groupName, receiverName) {
    return {
        sender: senderName,
        dest: receiverName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_GROUP_UNBAN
    }
}

Message.getServerGroupStatesMessage = function (senderName, groupName, events) {
    return {
        sender: senderName,
        group: groupName,
        action: this.MESSAGE_TYPE_SERVER_GROUP_STATES,
        events: events
    }
}

module.exports = Message
