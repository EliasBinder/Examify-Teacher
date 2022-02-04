let reqfile = require('./intercomHandlers/reqfile/handler')
let openlink = require('./intercomHandlers/openlink/handler')
let dialog = require('./intercomHandlers/dialog/handler')
let registerWindowEvent = require('./intercomHandlers/registerWindowEvent/handler')
let filesystem = require('./intercomHandlers/filesystem/handler')
let cookie = require('./intercomHandlers/cookie/handler')

module.exports.CHANNEL_LIST = {
    'reqfile': reqfile,
    'openlink': openlink,
    'dialog': dialog,
    'registerWindowEvent': registerWindowEvent,
    'filesystem': filesystem,
    'cookie': cookie
};

module.exports.process = async function (method, param) {
    let handler = this.CHANNEL_LIST[method]
    return await handler.handle(param);
}
