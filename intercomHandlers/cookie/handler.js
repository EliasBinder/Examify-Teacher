const { session, app} = require('electron')
const path = require('path');
const fs = require('fs');
const cache = require('./../../cache')

module.exports.handle = async function (msg) {
    if (msg['mode'] === 'login') {
        const cookie = {
            url: msg['url'],
            name: 'JSESSIONID',
            value: msg['value'],
            sameSite: 'no_restriction'
        };
        await cache.mainWin.webContents.session.cookies.set(cookie);
        await cache.mainWin.webContents.session.cookies.flushStore();
        let sessionFile = {
            'url': msg['url'],
            'value': msg['value']
        };
        let sessionTxtPath = path.join(app.getPath('userData'), 'session.txt');
        fs.writeFileSync(sessionTxtPath, JSON.stringify(sessionFile), {encoding: 'utf-8'});
        return {};
    }else if (msg['mode'] === 'logout'){
        await session.defaultSession.cookies.remove(msg['url'], 'JSESSIONID');
        await session.defaultSession.cookies.flushStore();
        return {};
    }else if (msg['mode'] === 'info'){
        let cookies = await session.defaultSession.cookies.get({})
        return {cookies: cookies};
    }
}
