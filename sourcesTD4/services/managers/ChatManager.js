const Chat = require('../../data-models/Chat')

function ChatManager () {
    this.history = []
}

ChatManager.prototype.addMessageToHistory = function (nickname, receiver, group, type, text, sentAt) {
    this.history[this.history.length > 0? this.history.length : 0] = new Chat(
        nickname,
        receiver,
        group,
        type,
        text,
        sentAt
    )
}

ChatManager.prototype.getGroupChatHistory = function (group, callback) {
    var result = []
    this.history.forEach(function (chatMsg) {
        if (chatMsg.group === group.groupName) {
            result[result.length > 0? result.length : 0] = chatMsg
        }
    })

    callback(result)
}

module.exports = ChatManager
