const shell = require('electron').shell;

module.exports.handle = function (msg) {
    shell.openExternal(msg['url']);
    return {};
}
