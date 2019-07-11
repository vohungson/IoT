function Chat (sender, receiver, group, type, text, sentAt) {
    this.sender = sender
    this.receiver = receiver
    this.text = text
    this.sentAt = sentAt
    this.group = group
    this.type = type
}

Chat.CHAT_TYPE_BROADCAST          = 'broadcast'
Chat.CHAT_TYPE_PRIVATE            = 'private'

module.exports = Chat
