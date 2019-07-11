function Event (sender, receiver, group, eventName, eventContent, createdAt) {
    this.sender = sender
    this.receiver = receiver
    this.group = group
    this.eventName = eventName
    this.eventContent = eventContent
    this.createdAt = createdAt
}

Event.EVENT_TYPE_CONNECTION         = 'event-connection'
Event.EVENT_TYPE_BROADCAST          = 'event-broadcast'
Event.EVENT_TYPE_LIST_CLIENTS       = 'event-list-clients'
Event.EVENT_TYPE_QUIT               = 'event-quit'
Event.EVENT_TYPE_SEND               = 'event-send'
Event.EVENT_TYPE_CREATE_GROUP       = 'event-create-group'
Event.EVENT_TYPE_JOIN_GROUP         = 'event-join-group'
Event.EVENT_TYPE_BROADCAST_GROUP    = 'event-broadcast-group'
Event.EVENT_TYPE_LIST_GROUP_CLIENTS = 'event-list-group-clients'
Event.EVENT_TYPE_GROUP_MESSAGES     = 'event-group-messages'
Event.EVENT_TYPE_GROUPS             = 'event-groups'
Event.EVENT_TYPE_LEAVE_GROUP        = 'event-leave-group'
Event.EVENT_TYPE_INVITE_TO_GROUP    = 'event-invite-to-group'
Event.EVENT_TYPE_KICK_OUT_GROUP     = 'event-kick-group'
Event.EVENT_TYPE_GROUP_BAN          = 'event-group-ban'
Event.EVENT_TYPE_GROUP_UNBAN        = 'event-group-unban'
Event.EVENT_TYPE_GROUP_STATES       = 'event-group-states'
Event.EVENT_TYPE_LEAVE_CHAT         = 'event-leave-chat'

module.exports = Event
