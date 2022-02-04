const { session } = require('electron')

module.exports.handle = async function (msg) {
    const cookie = {
        url: msg['url'],
        name: 'JSESSIONID',
        value: msg['value']
    }
    await session.defaultSession.cookies.set(cookie);
    return {};
}
