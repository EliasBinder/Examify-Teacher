const cache = require('./../../cache')
const { app } = require('electron')

module.exports.handle = function (msg) {
    let callbackFunc = msg.callbackFunc;
    let event = msg.event;
    let win = cache.mainWin;

    win.on(event, async e => {
        e.preventDefault();
        let result = await win.webContents.executeJavaScript(callbackFunc + '()')
        if (result){
            if (event == 'close') {
                win.destroy();
                app.quit();
            }
        }
    });
}
