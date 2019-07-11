function Error (errorCode, errorMsg) {
    this.errorCode = errorCode
    this.errorMessage = errorMsg
}

Error.ERROR_CODE_GROUP_NOT_EXIST          = 100
Error.ERROR_CODE_SOCKET_NOT_EXIST         = 101
Error.ERROR_CODE_INVALID_OPERATION        = 102
Error.ERROR_CODE_CLIENT_BANNED            = 103

module.exports = Error
