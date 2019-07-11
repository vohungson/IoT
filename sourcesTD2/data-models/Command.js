const Utils = require('../services/ObjectUtils')

function Command (commandType, params) {
    this.commandType = commandType
    this.params = params
}

Command.COMMAND_TYPE_BROADCAST          = 'command-broadcast'
Command.COMMAND_TYPE_LIST_CLIENTS       = 'command-list-clients'
Command.COMMAND_TYPE_QUIT               = 'command-quit'
Command.COMMAND_TYPE_SEND               = 'command-send'
Command.COMMAND_TYPE_CREATE_GROUP       = 'command-create-group'
Command.COMMAND_TYPE_JOIN_GROUP         = 'command-join-group'
Command.COMMAND_TYPE_BROADCAST_GROUP    = 'command-broadcast-group'
Command.COMMAND_TYPE_LIST_GROUP_CLIENTS = 'command-list-group-clients'
Command.COMMAND_TYPE_GROUP_MESSAGES     = 'command-group-messages'
Command.COMMAND_TYPE_GROUPS             = 'command-groups'
Command.COMMAND_TYPE_LEAVE_GROUP        = 'command-leave-group'
Command.COMMAND_TYPE_INVITE_TO_GROUP    = 'command-invite-to-group'
Command.COMMAND_TYPE_KICK_OUT_GROUP     = 'command-kick-group'
Command.COMMAND_TYPE_GROUP_BAN          = 'command-group-ban'
Command.COMMAND_TYPE_GROUP_UNBAN        = 'command-group-unban'
Command.COMMAND_TYPE_GROUP_STATES       = 'command-group-states'

Command.getCommandType = function (commandSymbol) {
    if (Utils.isEmpty(commandSymbol)) {
        return null
    }

    switch (commandSymbol) {
        case 'b':
            return this.COMMAND_TYPE_BROADCAST
        case 'ls':
            return this.COMMAND_TYPE_LIST_CLIENTS
        case 'q':
            return this.COMMAND_TYPE_QUIT
        case 's':
            return this.COMMAND_TYPE_SEND
        case 'cg':
            return this.COMMAND_TYPE_CREATE_GROUP
        case 'j':
            return this.COMMAND_TYPE_JOIN_GROUP
        case 'bg':
            return this.COMMAND_TYPE_BROADCAST_GROUP
        case 'members':
            return this.COMMAND_TYPE_LIST_GROUP_CLIENTS
        case 'messages':
            return this.COMMAND_TYPE_GROUP_MESSAGES
        case 'groups':
            return this.COMMAND_TYPE_GROUPS
        case 'leave':
            return this.COMMAND_TYPE_LEAVE_GROUP
        case 'invite':
            return this.COMMAND_TYPE_INVITE_TO_GROUP
        case 'kick':
            return this.COMMAND_TYPE_KICK_OUT_GROUP
        case 'ban':
            return this.COMMAND_TYPE_GROUP_BAN
        case 'unban':
            return this.COMMAND_TYPE_GROUP_UNBAN
        case 'states':
            return this.COMMAND_TYPE_GROUP_STATES
        default:
            return null
    }
}

module.exports = Command
