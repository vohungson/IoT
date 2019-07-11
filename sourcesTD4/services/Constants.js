const path = require('path')

function Constants () {
}

var configPath = path.join(__dirname, '..', '..', 'resources', 'config', 'config.json')
var privateKeyPath = path.join(__dirname, '..', '..', 'resources', 'certs', 'private-key.pem')
var publicCertPath = path.join(__dirname, '..', '..', 'resources', 'certs', 'public-cert.pem')
var dhCertPath = path.join(__dirname, '..', '..', 'resources', 'certs', 'dh-cert.pem')

Constants.PATH_CONFIG_FILE = configPath
Constants.PATH_PRIVATE_KEY = privateKeyPath
Constants.PATH_PUBLIC_CERT = publicCertPath
Constants.PATH_DH_CERT     = dhCertPath

module.exports = Constants
