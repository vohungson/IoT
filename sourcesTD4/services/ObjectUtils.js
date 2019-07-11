function ObjectUtils () {
}

ObjectUtils.isEmpty = function(value) {
    var valueType = typeof value
    switch(valueType){
        case 'object':
            return value === undefined || value === null || value.length === 0 || !Object.keys(value).length
            break

        case 'string':
            var string = value.trim()
            return value === undefined || string === null || string === '' || string === undefined
            break

        case 'number':
            return value === ''
            break

        default:
            return value === undefined || value === null || value === ''
    }
}

module.exports = ObjectUtils
