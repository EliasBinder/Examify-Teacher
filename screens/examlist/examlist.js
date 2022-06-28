//{import overlay/template/navigation.js}

if (typeof exam_referenceID === 'undefined')
    var exam_referenceID;

if (typeof examlist === 'undefined')
    var examlist;
examlist = {};

if (typeof currentlyRenderedExams === 'undefined')
    var currentlyRenderedExams;
currentlyRenderedExams = {};

if (typeof currentExamID === 'undefined')
    var currentExamID;
currentExamID = -1;

if (typeof shareExam_chipsInput === 'undefined')
    var shareExam_chipsInput;
shareExam_chipsInput;

//initialize MaterializeCss components
domLoadListenerAdd(() => {
    let elemsFloatingBtn = document.querySelectorAll('.fixed-action-btn');
    let instancesFloatingBtn = M.FloatingActionButton.init(elemsFloatingBtn);
    let elemsModal = document.querySelectorAll('.modal');
    let instancesModal = M.Modal.init(elemsModal);
    let elemsShare = document.querySelectorAll('.chips');
    let instancesShare = M.Chips.init(elemsShare);
    shareExam_chipsInput = instancesShare[0];
});

/**
 * Toggle search bar
 */
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

/**
 * open an exam
 * @param examID exam id to open
 */
function openExam(examID){
    exam_referenceID = examID;
    render('exam', 'main');
}

/**
 * create a new exam
 */
function createExam(){
    let modalInstance = M.Modal.getInstance(document.getElementById('modal-create'));
    modalInstance.open();
}

/**
 * close create exam modal
 */
function createExam_close(){
    document.getElementById('modal-create-newname').value = 'New Exam';
    let modalInstance = M.Modal.getInstance(document.getElementById('modal-create'));
    modalInstance.close();
}

/**
 * submit the creation of a new exam to backend
 * @returns {boolean}
 */
function createExam_submit() {
    if (document.getElementById('modal-create-newname').value.trim().length == 0){
        M.toast({html: 'Invalid name for an exam'});
        return false;
    }

    apiCall('PUT', {
        'name': document.getElementById('modal-create-newname').value.trim()
    }, 'examlist/exam', false, (success, json) => {
        if (success) {
            exam_referenceID = json['examID'];
            render('exam', 'main');
        }else{
            M.toast({html: 'Could not create a new exam!'});
        }
    });
}

/**
 * get a list of all exams of the user
 */
function retrieveExamlist() {
    apiCall('GET', null, 'examlist', false, (success, json) => {
        if (success){
            examlist = json;
            renderExams(examlist);
        }else{
            M.toast({html: 'Could not retrieve your exams! Please try again later!'});
        }
    });
}
retrieveExamlist();

/**
 * render content of examlist into dom
 * @param exams examlist to render
 */
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

    currentlyRenderedExams = exams;
}

/**
 * search for an exam
 */
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

/**
 * cancel search
 */
function cancelSearch() {
    renderExams(examlist);
}


function renameExam(id){
    document.getElementById('modal-rename-title').innerText = 'Rename \'' + examlist[id].name + '\'';
    document.getElementById('modal-rename-newname').value = examlist[id].name;
    currentExamID = id;
    let modalInstance = M.Modal.getInstance(document.getElementById('modal-rename'));
    modalInstance.open();
}

function renameExam_submit(){
    if (document.getElementById('modal-rename-newname').value.trim().length == 0){
        M.toast({html: 'Invalid name for an exam'});
        return false;
    }

    apiCall('PATCH', {
        'examID': currentExamID,
        'newName': document.getElementById('modal-rename-newname').value.trim()
    }, 'examlist/exam', false, (success, json) => {
        if (success) {
            examlist[currentExamID].name = json['newName'];
            if (currentlyRenderedExams.hasOwnProperty(currentExamID))
                currentlyRenderedExams[currentExamID].name = json['newName'];
            renderExams(currentlyRenderedExams);
        }else{
            M.toast({html: 'Could not rename the exam!'});
        }
    });
}



function deleteExam(id){
    document.getElementById('modal-delete-title').innerText = 'Delete \'' + examlist[id].name + '\'';
    document.getElementById('modal-delete-body').innerText = 'Are you sure that you want to delete the exam \'' + examlist[id].name + '\'?';
    currentExamID = id;
    let modalInstance = M.Modal.getInstance(document.getElementById('modal-delete'));
    modalInstance.open();
}

function deleteExam_submit() {
    apiCall('DELETE', {
        'examID': currentExamID
    }, 'examlist/exam', false, (success, json) => {
        if (success) {
            delete examlist[currentExamID];
            if (currentlyRenderedExams.hasOwnProperty(currentExamID))
                delete currentlyRenderedExams[currentExamID];
            renderExams(currentlyRenderedExams);
        }else{
            M.toast({html: 'Could not delete the exam!'});
        }
    });
}

function shareExam(id) {
    currentExamID = id;
    apiCall('GET', null, 'sharedexamlist/' + id, false, (success, data) => {
        if (success){
            console.log(data);
            let curChipsData = shareExam_chipsInput.chipsData;
            for (let i = 0; i < curChipsData.length; i++){
                shareExam_chipsInput.deleteChip(i);
            }
            for (let user of data.targets){
                shareExam_chipsInput.addChip({
                    tag: user
                });
            }
            let modalInstance = M.Modal.getInstance(document.getElementById('modal-share'));
            modalInstance.open();
        }
    });
}

function shareExam_submit() {
    let content = {targets:[]};
    for (let chip of shareExam_chipsInput.chipsData){
        content.targets.push(chip.tag);
    }
    apiCall('PATCH', content, 'sharedexamlist/' + currentExamID, false, (success, data) => {
        if (!success){
            M.toast({html: 'Could not share that exam!'})
        }
        let modalInstance = M.Modal.getInstance(document.getElementById('modal-share'));
        modalInstance.close();
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

function addDragndrop(){
    let dragndropDiv = document.getElementById('dragndrop');

    dragndropDiv.addEventListener('drag', function (e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);

    dragndropDiv.addEventListener('dragstart', function (e) {
        e.preventDefault();
        e.stopPropagation();
    }, false);

    dragndropDiv.addEventListener('dragend', function (e) {
        dragndropDiv.classList.remove('dragndrop_ondrag');
        e.preventDefault();
        e.stopPropagation();
    }, false);

    dragndropDiv.addEventListener('dragover', function (e) {
        dragndropDiv.classList.add('dragndrop_ondrag');
        e.preventDefault();
        e.stopPropagation();
    }, false);

    dragndropDiv.addEventListener('dragenter', function (e) {
        dragndropDiv.classList.add('dragndrop_ondrag');
        e.preventDefault();
        e.stopPropagation();
    }, false);

    dragndropDiv.addEventListener('dragleave', function (e) {
        dragndropDiv.classList.remove('dragndrop_ondrag');
        e.preventDefault();
        e.stopPropagation();
    }, false);

    dragndropDiv.addEventListener('drop', function (e) {
        dragndropDiv.classList.remove('dragndrop_ondrag');
        let files = e.dataTransfer.files;
        e.preventDefault();
        e.stopPropagation();
        applyDragndrop(files);
    }, false);
}
addDragndrop();

function applyDragndrop(files) {
    for (let file of files){
        let reader = new FileReader();
        reader.onload = function (e) {
            try{
                let examJson = JSON.parse(this.result);
                apiCall('PUT', examJson, 'examlist/import', false, (success, data) => {
                    if (success){
                        document.getElementById('navbar_search').style.display = 'none';
                        document.getElementById('search').value = '';
                        cancelSearch();
                        retrieveExamlist();
                        renderExams(examlist);
                    }else{
                        M.toast({html: 'Could not import the exam file!'});
                    }
                });
            }catch (e){
                M.toast({html: 'Invalid exam file!'});
            }
        }
        reader.readAsText(file);
    }
}
