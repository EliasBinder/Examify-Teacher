var sidenav;

function render(path, containerID) {
    window.intercom.receive('reqfile', (json) => {
        if (sidenav)
            sidenav.close();
        document.getElementById(containerID).innerHTML = json['html'];
        if (json['js']) {
            let jsContainer = document.createElement('script');
            let jsText = document.createTextNode(json['js']);
            jsContainer.appendChild(jsText);
            document.getElementById(containerID).appendChild(jsContainer);
        }
    });
    window.intercom.send('reqfile', {
        'path': path
    });
}

render('examlist', 'main');


let domLoadListenerCache = [];
let domLoadListenerFired = false;
document.addEventListener('DOMContentLoaded', function() {
    for (let i = 0; i < domLoadListenerCache.length; i++) {
        domLoadListenerCache[i]();
    }
    domLoadListenerFired = true;
});
function domLoadListenerAdd(func) {
    if (!domLoadListenerFired)
        domLoadListenerCache.push(func);
    else
        func();
}


function openDialogSync(type, options){
    return new Promise((resolve, reject) => {
        window.intercom.receive('dialog', (json) => {
            resolve(json);
        });
        window.intercom.send('dialog', {
            'type': 'open',
            'options': options
        });
    });
}
