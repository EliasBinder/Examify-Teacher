//{import overlay/template/navigation.js}

domLoadListenerAdd(() => {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems);
});

function toggleSearch(){
    if (document.getElementById('navbar_search').style.display == 'none') {
        document.getElementById('navbar_search').style.display = 'block';
        document.getElementById('search').focus();
    }else {
        document.getElementById('navbar_search').style.display = 'none';
        document.getElementById('search').value = '';
    }
}
