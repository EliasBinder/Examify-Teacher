domLoadListenerAdd(() => {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
    sidenav = instances[0];
});

function nav_openGitHub(){
    window.intercom.receive('openlink', (json) => {});
    window.intercom.send('openlink', {
        'url': 'https://github.com/EliasBinder/Examify-Teacher'
    });
}

function setProfileInfo() {
    document.getElementById('navigation_name').innerText = profileInfo['firstname'] + ' ' + profileInfo['lastname'];
    document.getElementById('navigation_email').innerText = profileInfo['email'];
    if (profileInfo['profileImg'] !== 'none')
        document.getElementById('navigation_profileImg').src = profileInfo['profileImg'];
}
setProfileInfo();
