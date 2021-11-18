let reqfile = require('./intercomHandlers/reqfile/handler')
let openlink = require('./intercomHandlers/openlink/handler')
let dialog = require('./intercomHandlers/dialog/handler')

module.exports.CHANNEL_LIST = {
    'reqfile': reqfile,
    'openlink': openlink,
    'dialog': dialog
};

module.exports.process = function (method, param) {
    let handler = this.CHANNEL_LIST[method]
    return handler.handle(param);
}
