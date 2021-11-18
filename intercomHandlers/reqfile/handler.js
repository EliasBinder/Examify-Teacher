const path = require('path')
const fs = require('fs')

module.exports.handle = function (msg) {
    let relativePath = [];
    if (msg['path'].includes('/'))
        relativePath = msg['path'].split('/');
    else
        relativePath.push(msg['path']);
    let fullPath = [__dirname, '..', '..', 'screens'];
    fullPath = fullPath.concat(relativePath);
    //result
    let result = {};
    //HTML
    let pathHTML = fullPath.slice();
    pathHTML.push(relativePath[relativePath.length - 1] + '.html');
    pathHTML = path.join.apply(null, pathHTML);
    let fileContentHTML = fs.readFileSync(pathHTML, {encoding: 'utf8'});
    fileContentHTML = processContent(fileContentHTML);
    result['html'] = fileContentHTML;
    //JS
    let pathJS = fullPath.slice();
    pathJS.push(relativePath[relativePath.length - 1] + '.js');
    pathJS = path.join.apply(null, pathJS);
    if (fs.existsSync(pathJS)){
        let fileContentJS = fs.readFileSync(pathJS, {encoding: 'utf8'});
        fileContentJS = processContent(fileContentJS);
        result['js'] = fileContentJS;
    }
    return result;
}

function processContent(content){
    let regex = /\/\/\{import (\S+?)\}/gms;
    let toImport = null;
    while (toImport = regex.exec(content)){
        let toReplace = toImport[0];
        let toGet = toImport[1];
        let relativePath = [];
        if (toGet.includes('/'))
            relativePath = toGet.split('/');
        else
            relativePath.push(toGet);
        let fullPath = [__dirname, '..', '..', 'screens'];
        fullPath = fullPath.concat(relativePath);
        let toGetPath = path.join.apply(null, fullPath);
        let toGetContent = fs.readFileSync(toGetPath, {encoding: 'utf8'});
        content = content.replace(toReplace, toGetContent);
    }
    return content;
}
