//{import overlay/template/navigation.js}

if (typeof exam_refID === 'undefined')
    var exam_refID;

if (typeof examlist === 'undefined')
    var examlist;
examlist = {};

if (typeof curRenderedExams === 'undefined')
    var curRenderedExams;
curRenderedExams = {};

if (typeof curActionExamID === 'undefined')
    var curActionExamID;
curActionExamID = -1;

domLoadListenerAdd(() => {
    let elemsModal = document.querySelectorAll('.modal');
    let instancesModal = M.Modal.init(elemsModal);
});

function toggleSearch(){
    if (document.getElementById('navbar_search').style.display == 'none') {
        document.getElementById('navbar_search').style.display = 'block';
        document.getElementById('search').focus();
    }else {
        document.getElementById('navbar_search').style.display = 'none';
        document.getElementById('search').value = '';
        cancelSearch();
    }
}

function openExam(examID){
    exam_refID = examID;
    render('exam', 'main');
}


function retreiveExamlist() {
    apiCall('GET', null, 'sharedexamlist', false, (success, json) => {
        if (success){
            examlist = json;
            renderExams(examlist);
        }else{
            M.toast({html: 'Could not retreive exams that are shared with you! Please try again later!'});
        }
    });
}
retreiveExamlist();

function renderExams(exams) {
    document.getElementById('examlist_container').innerHTML = '';

    let dom_curRow;
    let createNewRow = true;
    for (let examID of Object.keys(exams)){
        if (createNewRow){
            dom_curRow = document.createElement('div');
            dom_curRow.classList.add('row');
            document.getElementById('examlist_container').appendChild(dom_curRow);
            createNewRow = false;
        }else{
            createNewRow = true;
        }

        let examEntityHTML = document.getElementById('examlist_examEntity').innerHTML;
        examEntityHTML = examEntityHTML
            .replaceAll('%id%', examID)
            .replaceAll('%name%', exams[examID].name)
            .trim();
        let examEntityTemplate = document.createElement('template');
        examEntityTemplate.innerHTML = examEntityHTML;
        dom_curRow.appendChild(examEntityTemplate.content.firstChild);
    }

    curRenderedExams = exams;
}

function search() {
    let searchText = document.getElementById('search').value;
    let searchResult = {};
    for(let examID of Object.keys(examlist)){
        if (examlist[examID].name.includes(searchText)){
            searchResult[examID] = examlist[examID];
        }
    }
    renderExams(searchResult);
}

function cancelSearch() {
    renderExams(examlist);
}



function deleteExam(id){
    document.getElementById('modal-delete-title').innerText = 'Delete \'' + examlist[id].name + '\'';
    document.getElementById('modal-delete-body').innerText = 'Are you sure that you want to delete the exam \'' + examlist[id].name + '\'?';
    curActionExamID = id;
    let modalInstance = M.Modal.getInstance(document.getElementById('modal-delete'));
    modalInstance.open();
}

function deleteExam_submit() {
    apiCall('DELETE', {
        'examID': curActionExamID
    }, 'sharedexamlist/exam', false, (success, json) => {
        if (success) {
            delete examlist[curActionExamID];
            if (curRenderedExams.hasOwnProperty(curActionExamID))
                delete curRenderedExams[curActionExamID];
            renderExams(curRenderedExams);
        }else{
            M.toast({html: 'Could not delete the exam!'});
        }
    });
}


function exportExam(id) {
    apiCall('GET', null, 'exam/' + id + '/getpackage', false, async (success, json) => {
        if (success) {
            let examStr = JSON.stringify(json, null, '  ');
            let dialogResult = await showDialogSync('save', {
                'title': 'Save Exam',
                'filters': [
                    {name: 'json', extensions: ['json']}
                ],
                'properties': [
                    'createDirectory', 'showOverwriteConfirmation'
                ]
            });
            console.log(dialogResult);
            if (Object.keys(dialogResult).length == 1){
                let x = dialogResult[Object.keys(dialogResult)[0]];
                let result = await writeToFile(x.path, examStr);
                if (result){
                    M.toast({html: 'Exam exported!'});
                }else {
                    M.toast({html: 'Failed to export the exam!'});
                }
            }
        } else
            M.toast({html: 'Could not download the exam!'});
    });
}
