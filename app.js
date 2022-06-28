const {app, dialog, BrowserWindow, ipcMain, session} = require('electron')
const path = require('path')
const intercom = require('./intercom')
const cache = require('./cache')
const fs = require('fs')

let win = null;

const createWindow = async () => {
    win = new BrowserWindow({
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'resources', 'images', 'icon.png')
    })

    let sessionTxtPath = path.join(app.getPath('userData'), 'session.txt');
    console.log("session.txt: " + sessionTxtPath);
    if (fs.existsSync(sessionTxtPath)) {
        let sessionFile = fs.readFileSync(sessionTxtPath, {encoding: 'utf-8'});
        let sessionJson = JSON.parse(sessionFile);
        const cookie = {
            url: sessionJson['url'],
            name: 'JSESSIONID',
            value: sessionJson['value'],
            sameSite: 'no_restriction'
        };
        cache.connectionURL = sessionJson['url'];
        await win.webContents.session.cookies.set(cookie);
        await win.webContents.session.cookies.flushStore();
    }

    await win.loadFile(path.join(__dirname, 'screens', 'overlay', 'overlay.html'))

    cache.mainWin = win
}

app.whenReady().then(async () => {
    app.dock.setIcon(path.join(__dirname, 'resources', 'images', 'icon.png'));
    createWindow();
})

app.on('window-all-closed', () => {
    app.quit()
})


for(let channelName of Object.keys(intercom.CHANNEL_LIST)){
    ipcMain.on(channelName, async (evt, msg) => {
        let response = await intercom.process(channelName, msg)
        if (typeof response !== 'undefined')
            win.webContents.send(channelName, response)
    })
}
