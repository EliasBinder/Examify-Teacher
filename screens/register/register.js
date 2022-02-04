sidenav = null;

function register() {
    let data = {
        ip: document.getElementById('register_ip').value.trim(),
        fn: document.getElementById('register_firstname').value.trim(),
        ln: document.getElementById('register_lastname').value.trim(),
        em: document.getElementById('register_email').value.trim(),
        p1: document.getElementById('register_password').value.trim(),
        p2: document.getElementById('register_password_confirm').value.trim()
    };

    for (let entry of Object.keys(data)){
        if (data[entry].length == 0) {
            M.toast({html: 'Please fill every textfield!'});
            return;
        }
    }

    if (data.p1 != data.p2){
        M.toast({html: 'The passwords do not match!'});
        return;
    }

    connection.url = 'http://' + data.ip + '/api/';

    let content = {
        username: data.em,
        password: data.p1,
        firstname: data.fn,
        lastname: data.ln
    }
    apiCall('PUT', content, 'auth/register', false, (success, data) => {
        if (success){
            render('login', 'main');
        }else{
            M.toast({html: 'Failed to register!'});
        }
    });
}
