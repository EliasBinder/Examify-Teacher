const { contextBridge, ipcRenderer } = require('electron');
const INTERCOM = {
    send: (channel, json) => ipcRenderer.send(channel, json),
    receive: (channel, callback) => ipcRenderer.once(channel, (evt, msg) => callback(msg))
};
contextBridge.exposeInMainWorld('intercom', INTERCOM);
