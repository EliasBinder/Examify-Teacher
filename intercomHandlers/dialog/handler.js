const dialog = require('electron').dialog
const path = require('path')

module.exports.handle = function (msg) {
    let result = null;
    if (msg['type'] == 'open')
        result = dialog.showOpenDialogSync(msg['options']||null);
    else if (msg['type'] == 'save')
        result = dialog.showSaveDialogSync(msg['options']||null);
    else if (msg['type'] == 'messageBox')
        return {responseInt: dialog.showMessageBoxSync(msg['options']||null)};

    if (typeof result === 'undefined')
        return {};

    let toReturn = [];
    if (!Array.isArray(result))
        result = [result];
    for (let p of result){
        toReturn.push({
            'path': p,
            'name': path.basename(p)
        });
    }
    return toReturn;
}
