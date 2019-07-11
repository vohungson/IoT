const Sqlite3 = require('sqlite3').verbose()
const Config = require('../Config')
const Bcrypt = require('bcrypt')
const Utils = require('../../services/ObjectUtils')

var database = new Sqlite3.Database(':memory:')

function SQLCredentialManager () {
    database.serialize(function() {
        database.run("CREATE TABLE Credentials (nickName TEXT, password TEXT, createdAt INTEGER)")

        this.addAccount = function (nickname, password, createdAt) {
            var bcryptRounds = Config.getConfig('BCRYPT_ROUNDS')
            Bcrypt.hash(password, bcryptRounds, function (error, hash) {
                if (error) {
                    return
                }

                var stmt = database.prepare("INSERT INTO Credentials VALUES (?, ?, ?)")
                stmt.run(nickname, hash, createdAt)
                stmt.finalize()
            })
        }

        var addAccount = this.addAccount
        var accounts = Config.getConfig('ACCOUNTS')
        accounts.forEach(function (account) {
            addAccount(account.nickName, account.password, Date.now())
        })
    })
}

SQLCredentialManager.prototype.authenticate = function (nickName, password, callback) {
    var comparePassword = this.comparePassword
    database.all(
        "SELECT * FROM Credentials WHERE nickName = ?",
        [nickName],
        function(err, accounts) {
            if (err) {
                console.log(err)
                return
            }

            var account = !Utils.isEmpty(accounts) && accounts.length > 0? accounts[0] : null
            comparePassword(password, !Utils.isEmpty(account)? account.password : null, callback)
        }
    );
}

SQLCredentialManager.prototype.comparePassword = function (password, hash, callback) {
    if (Utils.isEmpty(hash)) {
        callback(new Error(Error.ERROR_CODE_WRONG_ACCOUNT, 'Wrong account'), null)
        return
    }

    Bcrypt.compare(password, hash, function (error, result) {
        callback(error, result)
    })
}

module.exports = SQLCredentialManager
