const path = require('path')
const fs = require('fs')

module.exports.handle = function (msg) {
    let relativePath = msg['path'].split('/');
    let fullPath = [__dirname, '..', '..', 'screens'];
    fullPath = fullPath.concat(relativePath);
    fullPath = path.join.apply(null, fullPath);
    let fileContent = fs.readFileSync(fullPath, {encoding: 'utf8'});
    return {
        'content': fileContent
    }
}
