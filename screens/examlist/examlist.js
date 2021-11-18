//{import overlay/template/navigation.js}

if (typeof exam_refType === 'undefined')
    var exam_refType;

domLoadListenerAdd(() => {
    let elemsFloatingBtn = document.querySelectorAll('.fixed-action-btn');
    let instancesFloatingBtn = M.FloatingActionButton.init(elemsFloatingBtn);
    let elemsModal = document.querySelectorAll('.modal');
    let instancesModal = M.Modal.init(elemsModal);
    let elemsShare = document.querySelectorAll('.chips');
    let instancesShare = M.Chips.init(elemsShare);
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

function openExam(examID){
    exam_refType = 1;
    render('exam', 'main');
}

function createExam() {
    exam_refType = 0;
    render('exam', 'main');
}
