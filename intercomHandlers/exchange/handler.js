const cache = require('./../../cache')
module.exports.handle = async function (msg) {
    if (msg['var'] == 'connectionURL') {
        return {connectionURL: cache.connectionURL};
    }
    return {};
}
