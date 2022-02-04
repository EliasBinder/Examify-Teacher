sidenav = null;

function login() {
    let serverip = document.getElementById('login_ip').value;
    connection.url = 'http://' + serverip + '/api/';
    let content = {
        username: document.getElementById('login_email').value,
        password: document.getElementById('login_password').value
    };
    apiCall('POST', content, 'auth/login', false, (success, data) => {
        if (success){
            console.log(data.sessionid);
            window.intercom.receive('cookie', (data) => {
                getProfilePackage();
            });
            window.intercom.send('cookie', {
                'url': connection.url,
                'value': data.sessionid
            });
        }else{
            M.toast({html: 'Invalid credentials!'});
            document.getElementById('login_email').value = '';
            document.getElementById('login_password').value = '';
        }
    });
}
