const Sqlite3 = require('sqlite3').verbose()
const Chat = require('../../data-models/Chat')

var database = new Sqlite3.Database(':memory:')

function SQLChatManager () {
    database.serialize(function() {
        database.run("CREATE TABLE ChatHistory (sender TEXT, receiver TEXT, `group` TEXT, type TEXT, text TEXT, sentAt INTEGER)")
    })
}

SQLChatManager.prototype.addMessageToHistory = function (nickname, receiver, group, type, text, sentAt) {
    var stmt = database.prepare("INSERT INTO ChatHistory VALUES (?, ?, ?, ?, ?, ?)")
    stmt.run(nickname, receiver, group, type, text, sentAt)
    stmt.finalize()
}

SQLChatManager.prototype.getGroupChatHistory = function (group, callback) {
    database.all(
        "SELECT * FROM ChatHistory WHERE `group` = ?",
        [group.groupName],
        function(err, chatMsgs) {
            if (err) {
                console.log(err)
                return
            }

            callback(chatMsgs)
        }
    )
}

module.exports = SQLChatManager
