const fs = require('fs')

module.exports.handle = function (msg) {
    if (msg.type == 'write') {
        fs.writeFileSync(msg.path, msg.content);
        return true;
    }else if (msg.type == 'read'){
        let content = fs.readFileSync(msg.path, {encoding: 'utf8'});
        return {
            'content': content
        };
    }
}
