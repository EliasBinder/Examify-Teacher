//{import overlay/template/navigation.js}
//{import ../resources/QuillJs/script.js}
domLoadListenerAdd(() => {
    let elems = document.querySelectorAll('.dropdown-trigger');
    let instances = M.Dropdown.init(elems);
    var elems2 = document.querySelectorAll('.collapsible');
    var instances2 = M.Collapsible.init(elems2);
});

function initQuill() {
    let quill = new Quill('#quill-container', {
        theme: 'snow'
    });
}
initQuill();
