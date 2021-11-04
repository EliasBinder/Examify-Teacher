let reqfile = require('./intercomHandlers/reqfile/handler')

module.exports.CHANNEL_LIST = {
    'reqfile': reqfile
};

module.exports.process = function (method, param) {
    let handler = this.CHANNEL_LIST[method]
    return handler.handle(param);
}
