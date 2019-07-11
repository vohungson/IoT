const Event = require('../../data-models/Event')

function EventManager () {
    this.events = []
}

EventManager.prototype.addEvent = function (nickname, receiver, group, eventName, eventContent, createdAt) {
    this.events[this.events.length > 0? this.events.length : 0] = new Event(
        nickname,
        receiver,
        group,
        eventName,
        eventContent,
        createdAt
    )
}

EventManager.prototype.getGroupEvents = function (group) {
    var result = []
    this.events.forEach(function (event) {
        if (event.group === group.groupName) {
            result[result.length > 0? result.length : 0] = event
        }
    })

    return result
}

module.exports = EventManager
