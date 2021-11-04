function render(path, containerID) {
    window.intercom.receive('reqfile', (json) => {
        document.getElementById(containerID).innerHTML = json['content'];
    });
    window.intercom.send('reqfile', {
        'path': path
    });
}

render('login/login.html', 'main');
