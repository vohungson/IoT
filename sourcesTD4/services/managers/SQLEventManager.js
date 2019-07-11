const Sqlite3 = require('sqlite3').verbose()
const Event = require('../../data-models/Event')

var database = new Sqlite3.Database(':memory:')

function SQLEventManager () {
    database.run("CREATE TABLE Events (sender TEXT, receiver TEXT, `group` TEXT, eventName TEXT, eventContent TEXT, createdAt INTEGER)")
}

SQLEventManager.prototype.addEvent = function (nickname, receiver, group, eventName, eventContent, createdAt) {
    var stmt = database.prepare("INSERT INTO Events VALUES (?, ?, ?, ?, ?, ?)")
    stmt.run(nickname, receiver, group, eventName, eventContent, createdAt)
    stmt.finalize()
}

SQLEventManager.prototype.getGroupEvents = function (group, callback) {
    database.all(
        "SELECT * FROM Events WHERE `group` = ?",
        [group.groupName],
        function(err, chatMsgs) {
            if (err) {
                console.log(err)
                return
            }

            callback(chatMsgs)
        }
    );
}

module.exports = SQLEventManager
