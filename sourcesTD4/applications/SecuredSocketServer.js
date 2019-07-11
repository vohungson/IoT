const SocketIO = require('socket.io');
const TLS = require('tls')
const FileSystem = require('fs')

const Config = require('../services/Config')
const Constants = require('../services/Constants')
const Message = require('../data-models/Message')
const Event = require('../data-models/Event')
const Chat = require('../data-models/Chat')
const Error = require('../data-models/Error')
const Utils = require('../services/ObjectUtils')
const SocketUtils = require('../services/SocketUtils')
const ClientManager = require('../services/managers/ClientManager')
const GroupManager = require('../services/managers/GroupManager')
const EventManager = require('../services/managers/SQLEventManager')
const ChatManager = require('../services/managers/SQLChatManager')
const CredentialManager = require('../services/managers/SQLCredentialManager')
const ErrorHandler = require('../services/ErrorHandler')
const SocketManager = require('../services/managers/SocketManager')

var serverPort = Config.getConfig('SERVER_PORT')
var serverHost = Config.getConfig('SERVER_HOST')
var options = {
    key: FileSystem.readFileSync(Constants.PATH_PRIVATE_KEY),
    cert: FileSystem.readFileSync(Constants.PATH_PUBLIC_CERT),
    dhparam: FileSystem.readFileSync(Constants.PATH_DH_CERT)
}

var server = null
var socketManager = new SocketManager()
var clientManager = new ClientManager(server, socketManager)
var groupManager = new GroupManager(clientManager)
var eventManager = new EventManager()
var chatManager = new ChatManager()
var credentialManager = new CredentialManager()

server = TLS.createServer(options, function(socket) {
    var client = null
    var sockets = null
    var eventInfo = null
    var destSocket = null
    var errorMsg = null
    var error = null
    var sender = null
    var group = null
    var destClient = null
    var clients = null

    socket.on('data', function(data) {
        try {
            data = JSON.parse(data)
        } catch (error) {
            console.error(error)
            data = {}
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_AUTH) {
            if (clientManager.containsNickName(data.sender)) {
                errorMsg = 'This name ' + data.sender + ' existed. The communication will be disconnected'
                error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error, true)

                socket.destroy()

                return
            }

            var accountCallback = function (error, result) {
                if (error || Utils.isEmpty(result) || !result) {
                    errorMsg = data.sender + ' authenticated with Wrong account. The communication will be disconnected'
                    error = new Error(Error.ERROR_CODE_WRONG_ACCOUNT, errorMsg)
                    ErrorHandler.onServerError(data.sender, socket, error, true)

                    socket.destroy()

                    return
                }

                client = clientManager.getClient(data.sender)
                clientManager.removeClient(client)
                groupManager.removeClientInAllGroups(data.sender)

                clientManager.addClient(data.sender, data.sender)
                socketManager.addSocket(data.sender, socket)
                sender = data.sender

                eventInfo = data.sender + " joined the chat"
                eventManager.addEvent(
                    data.sender,
                    null,
                    null,
                    Event.EVENT_TYPE_CONNECTION,
                    eventInfo,
                    Date.now()
                )

                SocketUtils.emit(socket, 'message', Message.getServerHelloMessage(data.sender), true)

                sockets = clientManager.getAllClientSockets()
                SocketUtils.broadcast(
                    sockets,
                    'message',
                    null,
                    Message.getServerBroadcastMessage("Server", data.sender + " is connected"),
                    true
                )

                console.info(eventInfo)
            }

            credentialManager.authenticate(data.sender, data.password, accountCallback)
        }

        if (data.action === Message.MESSAGE_TYPE_CLIENT_BROADCAST) {
            sockets = clientManager.getAllClientSockets()
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerBroadcastMessage(data.sender, data.msg),
                true
            )

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
            SocketUtils.emit(
                socket,
                'message',
                Message.getServerListClientsMessage(data.sender, clientManager.connectClients),
                true
            )

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
            SocketUtils.emit(
                socket,
                'message',
                Message.getServerQuitMessage(data.sender, 'Server is stopping'),
                true
            )

            sockets = clientManager.getAllClientSockets()
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerQuitMessage(data.sender, 'Server is stopping'),
                true
            )

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
            destSocket = socketManager.getSocket(data.dest)
            if (Utils.isEmpty(destSocket)) {
                errorMsg = 'The socket of the nick name ' + data.dest + ' does not exist'
                error = new Error(Error.ERROR_CODE_SOCKET_NOT_EXIST, errorMsg)
                ErrorHandler.onServerError(data.sender, socket, error)

                return
            }

            SocketUtils.emit(
                destSocket,
                'message',
                Message.getServerSendMessage(data.sender, data.dest, data.msg),
                true
            )

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

            client = clientManager.getClient(data.sender)
            groupManager.addNewGroup(client, data.group, data.isPublic)

            SocketUtils.emit(
                socket,
                'message',
                Message.getServerGroupCreateMessage(data.sender, data.group),
                true
            )

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

            clients = groupManager.getClients(data.group)
            sockets = clientManager.getClientSockets(clients)
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerGroupJoinMessage(data.sender, data.group),
                true
            )

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

            clients = groupManager.getClients(data.group)
            sockets = clientManager.getClientSockets(clients)
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerGroupBroadcastMessage(data.sender, data.group, data.msg),
                true
            )
            
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
            SocketUtils.emit(
                socket,
                'message',
                Message.getServerGroupMembersMessage(data.sender, data.group, groupClients),
                true
            )

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

            var groupMessages = []
            var callback = function (chatMsgs) {
                chatMsgs.forEach(function (chatMsg) {
                    groupMessages[groupMessages.length > 0? groupMessages.length : 0] = new Chat(
                        chatMsg.sender,
                        chatMsg.receiver,
                        chatMsg.group,
                        chatMsg.type,
                        chatMsg.text,
                        chatMsg.sentAt
                    )
                })

                SocketUtils.emit(
                    socket,
                    'message',
                    Message.getServerGroupMessagesMessage(data.sender, data.group, groupMessages),
                    true
                )
            }
            chatManager.getGroupChatHistory(messagesGroup, callback)

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
            SocketUtils.emit(
                socket,
                'message',
                Message.getServerGroupsMessage(data.sender, groups),
                true
            )

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

            clients = groupManager.getClients(data.group)
            sockets = clientManager.getClientSockets(clients)
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerGroupLeaveMessage(data.sender, data.group),
                true
            )

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

            destClient = clientManager.getClient(data.dest)
            groupManager.addClient(destClient, data.group)

            clients = groupManager.getClients(data.group)
            sockets = clientManager.getClientSockets(clients)
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerGroupInviteMessage(data.sender, data.group, data.dest),
                true
            )

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

            clients = groupManager.getClients(data.group)
            sockets = clientManager.getClientSockets(clients)
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerGroupKickMessage(data.sender, data.group, data.dest, data.reason),
                true
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

            clients = groupManager.getClients(data.group)
            sockets = clientManager.getClientSockets(clients)
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerGroupBanMessage(data.sender, data.group, data.dest, data.reason),
                true
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

            clients = groupManager.getClients(data.group)
            sockets = clientManager.getClientSockets(clients)
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerGroupUnBanMessage(data.sender, data.group, data.dest),
                true
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

            var eventCallback = function (events) {
                var groupStates = []
                events.forEach(function (event) {
                    groupStates[groupStates.length > 0? groupStates.length : 0] = new Event(
                        event.sender,
                        event.receiver,
                        event.group,
                        event.eventName,
                        event.eventContent,
                        event.createdAt
                    )
                })

                SocketUtils.emit(
                    socket,
                    'message',
                    Message.getServerGroupStatesMessage(data.sender, data.group, groupStates),
                    true
                )
            }
            eventManager.getGroupEvents(statedGroup, eventCallback)

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
    });

    socket.on('close', function () {

        var disconnectedClient = clientManager.getClientById(sender)
        if (!Utils.isEmpty(disconnectedClient)) {
            eventInfo = disconnectedClient.nickName + " left the chat"

            sockets = clientManager.getAllClientSockets()
            SocketUtils.broadcast(
                sockets,
                'message',
                null,
                Message.getServerBroadcastMessage("Server", eventInfo),
                true
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

    socket.on('end', function() {
    });
})

server.listen(serverPort, serverHost, function () {
    console.log('Server is listening at the port ' + serverPort)
})

var validateClientInGroup = function (sender, dest, groupName, socket) {
    var group = groupManager.getGroup(groupName)
    var errorMsg = null
    var error = null

    if (Utils.isEmpty(group)) {
        errorMsg = 'The group ' + groupName + ' does not exist'
        error = new Error(Error.ERROR_CODE_GROUP_NOT_EXIST, errorMsg)
        ErrorHandler.onServerError(sender, socket, error, true)

        return null
    }

    var client = clientManager.getClient(sender)
    if (!group.contains(client)) {
        errorMsg = 'The sender ' + sender + ' does not belong to the group ' + groupName
        error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
        ErrorHandler.onServerError(sender, socket, error, true)

        return null
    }

    if (client && client.isBanned(groupName)) {
        errorMsg = 'The sender ' + sender + ' was banned in the group ' + groupName
        error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
        ErrorHandler.onServerError(sender, socket, error, true)

        return null
    }

    if (sender === dest) {
        errorMsg = 'Bad command. The sender and receiver are the same.'
        error = new Error(Error.ERROR_CODE_INVALID_OPERATION, errorMsg)
        ErrorHandler.onServerError(sender, socket, error, true)

        return
    }

    return group
}

