domLoadListenerAdd(() => {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems);
    sidenav = instances[0];
});

function nav_openGitHub(){
    window.intercom.receive('openlink', (json) => {});
    window.intercom.send('openlink', {
        'url': 'https://github.com/EBinderUniBZ/Examify-Teacher'
    });
}
