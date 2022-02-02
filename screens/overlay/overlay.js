var sidenav;

let connection = {
    "url": "http://127.0.0.1:8080/api/"
}
let profileInfo = {

}

let offlineBridge = {

}

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


function showDialogSync(type, options){
    return new Promise((resolve) => {
        window.intercom.receive('dialog', (json) => {
            resolve(json);
        });
        window.intercom.send('dialog', {
            'type': type,
            'options': options
        });
    });
}

function setLoadingOverlay(newstate = false) {
    let domLoading = document.getElementById('loading_overlay');
    if (newstate)
        domLoading.style.display = 'block';
    else
        domLoading.style.display = 'none';
}

function apiCall(method, content = null, path, inBackground = true, callback) {
    if (!inBackground) {
        setLoadingOverlay(true);
    }
    let request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (!inBackground) {
                setLoadingOverlay(false);
            }
            let respJSON = JSON.parse(this.response);
            if (respJSON['success'] === true){
                callback(true, respJSON['content']);
            }else{
                callback(false, {});
            }
        }else if (this.readyState == 4 && this.status != 200 || this.readyState == 0){
            if (!inBackground) {
                setLoadingOverlay(false);
            }
            offlineBridge = {
                'method': method,
                'content': content,
                'path': path,
                'inBackground': inBackground,
                'callback': callback
            };
            render('offline', 'main');
        }
    };
    if (inBackground) {
        request.timeout = 30000;
    }
    request.ontimeout = async function (e) {
        if (!inBackground) {
            setLoadingOverlay(false);
        }
        offlineBridge = {
            'method': method,
            'content': content,
            'path': path,
            'inBackground': inBackground,
            'callback': callback
        };
        render('offline', 'main');
    };
    request.open(method, connection.url + path, true);
    if (content != null) {
        request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
        request.send(JSON.stringify(content));
    }else
        request.send();
}

function apiCallSync(method, content = null, path) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                let respJSON = JSON.parse(this.response);
                if (respJSON['success'] === true){
                    resolve(respJSON['content']);
                }else{
                    reject();
                }
            }else if (this.readyState == 4 && this.status != 200 || this.readyState == 0){
                reject();
            }
        };
        request.open(method, connection.url + path, false);
        if (content != null) {
            request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
            request.send(JSON.stringify(content));
        }else
            request.send();
    });
}

function getProfilePackage() {
    apiCall('GET', null, 'profile/package', false, (success, json) => {
        if (success) {
            profileInfo = json;
            render('examlist', 'main');
        }else{
            render('offline', 'main');
        }
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    getProfilePackage();
});

function setWindowEvent(event, callbackFunctionName) {
    return new Promise(resolve => {
        window.intercom.receive('registerWindowEvent', (json) => {
            resolve(json);
        });
        window.intercom.send('registerWindowEvent', {
            'callbackFunc': callbackFunctionName,
            'event': event
        });
    });
}

function writeToFile(path, content) {
    return new Promise(resolve => {
        window.intercom.receive('filesystem', (json) => {
            resolve(json);
        });
        window.intercom.send('filesystem', {
            'type': 'write',
            'path': path,
            'content': content
        });
    });
}

function readFromFile(path) {
    return new Promise(resolve => {
        window.intercom.receive('filesystem', (json) => {
            resolve(json.content);
        });
        window.intercom.send('filesystem', {
            'type': 'read',
            'path': path
        });
    });
}


//Source: https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
