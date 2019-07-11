const SocketIO = require('socket.io');
const Config = require('../services/Config')
const Message = require('../data-models/Message')
const Event = require('../data-models/Event')
const Chat = require('../data-models/Chat')
const Error = require('../data-models/Error')
const Utils = require('../services/ObjectUtils')
const ClientManager = require('../services/managers/ClientManager')
const GroupManager = require('../services/managers/GroupManager')
const EventManager = require('../services/managers/EventManager')
const ChatManager = require('../services/managers/ChatManager')
const ErrorHandler = require('../services/ErrorHandler')

var serverPort = Config.getConfig('SERVER_PORT')
var serverSocket = SocketIO.listen(serverPort)

console.log('Server is listening at the port ' + serverPort)

var clientManager = new ClientManager(serverSocket)
var groupManager = new GroupManager(clientManager)
var eventManager = new EventManager()
var chatManager = new ChatManager()

serverSocket.on('connect', function (socket) {
    onListenConnect(socket)
})

var errorMsg = null
var error = null
var eventInfo = null
var destClient = null

var onListenConnect = function (socket) {
    socket.on('send', function (data) {
        if (data.action === Message.MESSAGE_TYPE_CLIENT_CONNECTION) {
            if (clientManager.containsNickName(data.sender)) {
                errorMsg = 'This name ' + data.sender + ' existed. The communication will be disconnected'
                error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error)

                socket.disconnect(true)

                return
            }

            socket.emit('message', Message.getServerHelloMessage(data.sender))

            socket.broadcast.emit(
                'message',
                Message.getServerBroadcastMessage("Server", data.sender + " is connected")
            )

            clientManager.addClient(socket.id, data.sender)

            eventInfo = data.sender + " joined the chat"
            eventManager.addEvent(
                data.sender,
                null,
                null,
                Event.EVENT_TYPE_CONNECTION,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_BROADCAST) {
            socket.broadcast.emit('message', Message.getServerBroadcastMessage(data.sender, data.msg))

            chatManager.addMessageToHistory(
                data.sender,
                null,
                null,
                Chat.CHAT_TYPE_BROADCAST,
                data.msg,
                Date.now()
            )

            eventInfo = data.sender + " broadcasted the message"
            eventManager.addEvent(
                data.sender,
                null,
                null,
                Event.EVENT_TYPE_BROADCAST,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_LIST_CLIENTS) {
            socket.emit('message', Message.getServerListClientsMessage(data.sender, clientManager.connectClients))

            eventInfo = data.sender + " requested clients list"
            eventManager.addEvent(
                data.sender,
                null,
                null,
                Event.EVENT_TYPE_LIST_CLIENTS,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_QUIT) {
            socket.emit('message', Message.getServerQuitMessage(data.sender, 'Server is stopping'))

            eventInfo = data.sender + " requested server to quit"
            eventManager.addEvent(
                data.sender,
                null,
                null,
                Event.EVENT_TYPE_QUIT,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)

            process.exit()
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_SEND) {
            destSocket = clientManager.findSocketByNickName(data.dest)
            if (Utils.isEmpty(destSocket)) {
                errorMsg = 'The socket of the nick name ' + data.dest + ' does not exist'
                error = new Error(Error.ERROR_CODE_SOCKET_NOT_EXIST, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error)

                return
            }

            destSocket.emit('message', Message.getServerSendMessage(data.sender, data.dest, data.msg))

            chatManager.addMessageToHistory(
                data.sender,
                data.dest,
                null,
                Chat.CHAT_TYPE_PRIVATE,
                data.msg,
                Date.now()
            )

            eventInfo = data.sender + " sent the message to " + data.dest
            eventManager.addEvent(
                data.sender,
                data.dest,
                null,
                Event.EVENT_TYPE_SEND,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_CREATE_GROUP) {
            if (groupManager.containsGroup(data.group)) {
                errorMsg = 'The group ' + data.group + ' existed'
                error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error)

                return
            }

            var client = clientManager.getClient(data.sender)
            groupManager.addNewGroup(client, data.group, data.isPublic)
            socket.join(data.group)

            socket.emit('message', Message.getServerGroupCreateMessage(data.sender, data.group))

            eventInfo = data.sender  + ' created the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_CREATE_GROUP,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_JOIN_GROUP) {
            var joinedGroup = groupManager.getGroup(data.group)
            if (Utils.isEmpty(joinedGroup) || !joinedGroup.isPublic) {
                errorMsg = 'The group ' + data.group + ' does not exist'
                error = new Error(Error.ERROR_CODE_GROUP_NOT_EXIST, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error)

                return
            }

            destClient = clientManager.getClient(data.sender)
            groupManager.addClient(destClient, data.group)
            socket.join(data.group)

            socket.in(data.group).emit('message', Message.getServerGroupJoinMessage(data.sender, data.group))
            socket.emit('message', Message.getServerGroupJoinMessage(data.sender, data.group))

            eventInfo = data.sender  + ' joined the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_JOIN_GROUP,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_BROADCAST_GROUP) {
            var broadcastGroup = validateClientInGroup(data.sender, data.dest, data.group, socket)
            if (Utils.isEmpty(broadcastGroup)) {
                return
            }

            socket.to(data.group).emit('message', Message.getServerGroupBroadcastMessage(data.sender, data.group, data.msg))

            chatManager.addMessageToHistory(
                data.sender,
                null,
                data.group,
                Chat.CHAT_TYPE_BROADCAST,
                data.msg,
                Date.now()
            )

            eventInfo = data.sender  + ' broadcasted to the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_BROADCAST_GROUP,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_LIST_GROUP_CLIENTS) {
            var membersGroup = validateClientInGroup(data.sender, data.dest, data.group, socket)
            if (Utils.isEmpty(membersGroup)) {
                return
            }

            var groupClients = membersGroup.clients
            socket.emit('message', Message.getServerGroupMembersMessage(data.sender, data.group, groupClients))

            eventInfo = data.sender  + ' request members list in the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_LIST_GROUP_CLIENTS,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_GROUP_MESSAGES) {
            var messagesGroup = validateClientInGroup(data.sender, null, data.group, socket)
            if (Utils.isEmpty(messagesGroup)) {
                return
            }

            var groupMessages = chatManager.getGroupChatHistory(messagesGroup)
            socket.emit('message', Message.getServerGroupMessagesMessage(data.sender, data.group, groupMessages))

            eventInfo = data.sender  + ' request messages in the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_GROUP_MESSAGES,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_GROUPS) {
            var groups = groupManager.getGroups(data.sender)
            socket.emit('message', Message.getServerGroupsMessage(data.sender, groups))

            eventInfo = data.sender  + ' requested existing groups'
            eventManager.addEvent(
                data.sender,
                null,
                null,
                Event.EVENT_TYPE_GROUPS,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_LEAVE_GROUP) {
            groupManager.removeClient(data.sender, data.group)

            socket.in(data.group).emit('message', Message.getServerGroupLeaveMessage(data.sender, data.group))
            socket.emit('message', Message.getServerGroupLeaveMessage(data.sender, data.group))
            socket.leave(data.group, null)

            eventInfo = data.sender  + ' left the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_LEAVE_GROUP,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_INVITE_TO_GROUP) {
            var invitedGroup = validateClientInGroup(data.sender, data.dest, data.group, socket)
            if (Utils.isEmpty(invitedGroup)) {
                return
            }

            var destSocket = clientManager.findSocketByNickName(data.dest)
            if (Utils.isEmpty(destSocket)) {
                errorMsg = 'The socket of ' + data.dest + ' does not exist'
                error = new Error(Error.ERROR_CODE_SOCKET_NOT_EXIST, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error)

                return
            }

            destClient = clientManager.getClient(data.dest)
            groupManager.addClient(destClient, data.group)
            destSocket.join(data.group)

            socket.to(data.group).emit('message', Message.getServerGroupInviteMessage(data.sender, data.group, data.dest))
            socket.emit('message', Message.getServerGroupInviteMessage(data.sender, data.group, data.dest))

            eventInfo = data.sender  + ' invited ' + data.dest + ' into the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_INVITE_TO_GROUP,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_KICK_OUT_GROUP) {
            var kickedGroup = validateClientInGroup(data.sender, data.dest, data.group, socket)
            if (Utils.isEmpty(kickedGroup)) {
                return
            }

            groupManager.removeClient(data.dest, data.group)

            destSocket = clientManager.findSocketByNickName(data.dest)
            if (Utils.isEmpty(destSocket)) {
                errorMsg = 'The socket of ' + data.dest + ' does not exist'
                error = new Error(Error.ERROR_CODE_SOCKET_NOT_EXIST, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error)

                return
            }
            destSocket.leave(data.group, null)

            socket.to(data.group).emit(
                'message',
                Message.getServerGroupKickMessage(data.sender, data.group, data.dest, data.reason)
            )
            socket.emit(
                'message',
                Message.getServerGroupKickMessage(data.sender, data.group, data.dest, data.reason)
            )
            destSocket.emit(
                'message',
                Message.getServerGroupKickMessage(data.sender, data.group, data.dest, data.reason)
            )

            eventInfo = data.sender  + ' kicked ' + data.dest + ' out of the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_KICK_OUT_GROUP,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_GROUP_BAN) {
            var bannedGroup = validateClientInGroup(data.sender, data.dest, data.group, socket)
            if (Utils.isEmpty(bannedGroup)) {
                return
            }

            groupManager.banClient(data.dest, data.group)
            socket.to(data.group).emit(
                'message',
                Message.getServerGroupBanMessage(data.sender, data.group, data.dest, data.reason)
            )
            socket.emit(
                'message',
                Message.getServerGroupBanMessage(data.sender, data.group, data.dest, data.reason)
            )

            eventInfo = data.sender  + ' banned ' + data.dest + ' in the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_GROUP_BAN,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_GROUP_UNBAN) {
            var unbannedGroup = validateClientInGroup(data.sender, data.dest, data.group, socket)
            if (Utils.isEmpty(unbannedGroup)) {
                return
            }

            groupManager.unbanClient(data.dest, data.group)
            socket.to(data.group).emit(
                'message',
                Message.getServerGroupUnBanMessage(data.sender, data.group, data.dest, data.reason)
            )
            socket.emit(
                'message',
                Message.getServerGroupUnBanMessage(data.sender, data.group, data.dest, data.reason)
            )

            eventInfo = data.sender  + ' unbanned ' + data.dest + ' in the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_GROUP_UNBAN,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_GROUP_STATES) {
            var statedGroup = validateClientInGroup(data.sender, data.dest, data.group, socket)
            if (Utils.isEmpty(statedGroup)) {
                return
            }

            var events = eventManager.getGroupEvents(statedGroup)
            socket.emit('message', Message.getServerGroupStatesMessage(data.sender, data.group, events))

            eventInfo = data.sender  + ' request states in the group ' + data.group
            eventManager.addEvent(
                data.sender,
                null,
                data.group,
                Event.EVENT_TYPE_GROUP_STATES,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }
    })

    socket.on('disconnect', function () {
        var disconnectedClient = clientManager.getClientById(socket.id)

        if (!Utils.isEmpty(disconnectedClient)) {
            eventInfo = disconnectedClient.nickName + " left the chat"
            socket.broadcast.emit(
                'message',
                Message.getServerBroadcastMessage("Server", eventInfo)
            )

            clientManager.removeClient(disconnectedClient)
            groupManager.removeClientInAllGroups(disconnectedClient.nickName)

            eventManager.addEvent(
                disconnectedClient.nickName,
                null,
                null,
                Event.EVENT_TYPE_LEAVE_CHAT,
                eventInfo,
                Date.now()
            )

            console.info(eventInfo)
        }
    })
}

var validateClientInGroup = function (sender, dest, groupName, socket) {
    var group = groupManager.getGroup(groupName)
    if (Utils.isEmpty(group)) {
        errorMsg = 'The group ' + groupName + ' does not exist'
        error = new Error(Error.ERROR_CODE_GROUP_NOT_EXIST, errorMsg)
        ErrorHandler.onServerError(sender, socket, error)

        return null
    }

    var client = clientManager.getClient(sender)
    if (!group.contains(client)) {
        errorMsg = 'The sender ' + sender + ' does not belong to the group ' + groupName
        error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
        ErrorHandler.onServerError(sender, socket, error)

        return null
    }

    if (client && client.isBanned(groupName)) {
        errorMsg = 'The sender ' + sender + ' was banned in the group ' + groupName
        error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
        ErrorHandler.onServerError(sender, socket, error)

        return null
    }

    var destSocket = clientManager.findSocketByNickName(dest)
    if (!Utils.isEmpty(dest) && Utils.isEmpty(destSocket)) {
        errorMsg = 'The socket of ' + dest + ' does not exist'
        error = new Error(Error.ERROR_CODE_SOCKET_NOT_EXIST, errorMsg)
        ErrorHandler.onServerError(sender, socket, error)

        return
    }

    if (sender === dest) {
        errorMsg = 'Bad command. The sender and receiver are the same.'
        error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
        ErrorHandler.onServerError(sender, socket, error)

        return
    }

    return group
}
