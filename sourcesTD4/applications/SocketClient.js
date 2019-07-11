const Config = require('../services/Config')
const SocketIO = require('socket.io-client')
const Readline = require('readline')
const Yargs = require('yargs')
const Argv = Yargs
    .command('client', 'Chat client', {})
    .option('name', {
        description: 'Name of chatter',
        alias: 'n',
        type: 'string'
    })
    .option('password', {
        description: 'Password of chatter',
        alias: 'p',
        type: 'string'
    })
    .help()
    .alias('help', 'h')
    .argv
const Message = require('../data-models/Message')
const CommandParser = require('../services/CommandParser')
const Utils = require('../services/ObjectUtils')
const DateFormat = require('dateformat')

var terminal = Readline.createInterface(process.stdin, process.stdout)

var serverEndpoint = Config.getConfig('SERVER_ENDPOINT')
var socket = SocketIO.connect(serverEndpoint)
var senderName = Argv.name
var password = Argv.password

socket.emit('send', Message.getAuthMessage(senderName, password))
terminal.prompt(true)

socket.on('message', function (data) {
    if (data.action === Message.MESSAGE_TYPE_SERVER_HELLO) {
        console.info("[Client] Connected")
        terminal.prompt(true)
        console.info('[Server] ' + data.msg)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_ERROR) {
        console.info("[Server] Error: " + data.msg)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_BROADCAST) {
        console.info("[Broadcast] " + data.sender  + ': ' + data.msg)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_LIST_CLIENTS) {
        console.info("[Server] Client list")
        data.clients.forEach(function (client) {
            console.info('Client Id: ' + client.id + ' - Nick name: ' + client.nickName)
        })
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_QUIT) {
        console.info("[Server] " + data.msg)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_SEND) {
        console.info("[Private] " + data.sender  + ': ' + data.msg)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_CREATE_GROUP) {
        console.info("[Server] " + data.sender  + ' created the group ' + data.group)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_JOIN_GROUP) {
        console.info("[Server] " + data.sender  + ' joined the group ' + data.group)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_BROADCAST_GROUP) {
        console.info("[Broadcast] " + data.sender  + ' messaged to the group ' + data.group + ': ' + data.msg)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_LIST_GROUP_CLIENTS) {
        console.info("[Server] Client list of the group " + data.group)
        data.clients.forEach(function (client) {
            console.info('Socket Id: ' + client.id + ' - Nick name: ' + client.nickName)
        })
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_GROUP_MESSAGES) {
        console.info("[Server] Messages of the group " + data.group)
        data.messages.forEach(function (chat) {
            console.info(
                'Sender: ' + chat.sender +
                ' - Receiver: ' + chat.receiver +
                ' - Sent date: ' + DateFormat(chat.sentAt, "h:MM:ss dd-mm-yyyy") +
                ' - Text: ' + chat.text
            )
        })
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_GROUPS) {
        console.info("[Server] Groups")
        data.groups.forEach(function (group) {
            console.info(
                'Group name: ' + group.groupName
            )
        })
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_LEAVE_GROUP) {
        console.info("[Server] " + data.sender  + ' left the group ' + data.group)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_INVITE_TO_GROUP) {
        console.info("[Server] " + data.sender  + ' invited ' + data.dest + ' to the group ' + data.group)
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_KICK_OUT_GROUP) {
        console.info(
            "[Server] " + data.sender  +
            ' kicked ' + data.dest +
            ' out of the group ' + data.group +
            ' with reason ' + data.reason
        )
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_GROUP_BAN) {
        console.info(
            "[Server] " + data.sender  +
            ' banned ' + data.dest +
            ' in the group ' + data.group +
            ' with reason ' + data.reason
        )
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_GROUP_UNBAN) {
        console.info(
            "[Server] " + data.sender  +
            ' unbanned ' + data.dest +
            ' in the group ' + data.group
        )
    }

    if (data.action === Message.MESSAGE_TYPE_SERVER_GROUP_STATES) {
        console.info("[Server] Events of the group " + data.group)
        data.events.forEach(function (event) {
            console.info(
                'Event: ' + event.eventName +
                ' - Sender: ' + event.sender +
                ' - Receiver: ' + event.receiver +
                ' - Create date: ' + DateFormat(event.createdAt, "h:MM:ss dd-mm-yyyy") +
                ' - Detail: ' + event.eventContent
            )
        })
    }

    terminal.prompt(true)
})

socket.on('reconnect', function () {
    socket.emit('send', Message.getAuthMessage(senderName, password))
    terminal.prompt(true)
})

terminal.on('line', function (line) {
    var command = CommandParser.parse(line)
    if (!Utils.isEmpty(command)) {
        var msgObject = Message.getMessageByCommand(senderName, command)
        if (msgObject !== null) {
            socket.emit('send', msgObject)

            if (msgObject.action === Message.MESSAGE_TYPE_CLIENT_BROADCAST) {
                console.info("[Broadcast] Message: " + msgObject.msg)
            }

            if (msgObject.action === Message.MESSAGE_TYPE_CLIENT_SEND) {
                console.info("[Private] Message to " + msgObject.dest + ": " + msgObject.msg)
            }

            if (msgObject.action === Message.MESSAGE_TYPE_CLIENT_BROADCAST_GROUP) {
                console.info("[Broadcast] Message to the group " + msgObject.group + ": " + msgObject.msg)
            }
        }
    } else {
        console.info("[Client] Bad command")
    }

    terminal.prompt(true)
})
