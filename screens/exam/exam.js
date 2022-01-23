//{import overlay/template/navigation.js}
//{import ../resources/QuillJs/script.js}
domLoadListenerAdd(() => {
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
    M.Materialbox.init(document.querySelectorAll('.materialboxed'));

    //Modals
    M.Modal.init(document.querySelectorAll('#exam_modal_preview_audio'), {
        onCloseStart: function () {
            document.getElementById('exam_modal_preview_audio_audio').pause();
            document.getElementById('exam_modal_preview_audio_audio').src = '';
        },
        onOpenEnd: function () {
            document.getElementById('exam_modal_preview_audio_audio').currentTime = 0;
            document.getElementById('exam_modal_preview_audio_audio').play();
        }
    });
    M.Modal.init(document.querySelectorAll('#exam_modal_preview_video'), {
        onCloseStart: () => {
            document.getElementById('exam_modal_preview_video_video').pause();
            document.getElementById('exam_modal_preview_video_video').src = '';
        },
        onOpenEnd: () => {
            document.getElementById('exam_modal_preview_video_video').currentTime = 0;
            document.getElementById('exam_modal_preview_video_video').play();
        }
    });
    M.Modal.init(document.querySelectorAll('.modal.mautoinit'));
});

if (typeof examJson !== 'undefined'){
    var examJson;
}
examJson = {
    title: '',
    curQuestionId: 1,
    latestQuestionId: -1,
    questions: {}
};

if (typeof examChanges !== 'undefined'){
    var examChanges;
}
examChanges = {};

function retrieveExamPackage(){
    apiCall('GET', null, 'exam/getpackage?examid=' + exam_refID, false, (success, json) => {
        if (success) {
            examJson = json;
            //TODO: sync ui with examJson
        }else
            M.toast({html: 'Could not download the exam!'});
    });
}
//retrieveExamPackage(); TODO



function exam_updateQTitle(qid, newTitle){
    newTitle = newTitle.trim();
    document.getElementById(qid + '_question_title').innerHTML = '<i class="material-icons left">assignment</i>' +
        newTitle +
        '<i class="material-icons secondary-content-collapsible red-text" onclick="exam_removeQuestion(event, \'%qid%\')">delete</i></a>' +
        '<i class="material-icons secondary-content-collapsible blue-text" onclick="exam_moveQuestion_up(event, \'%qid%\')" style="right: 35px">arrow_upward</i>' +
        '<i class="material-icons secondary-content-collapsible blue-text" onclick="exam_moveQuestion_down(event, \'%qid%\')" style="right: 60px">arrow_downward</i>';
    if (!(examChanges.hasOwnProperty(qid))) {
        examChanges[qid] = {};
    }
    if (!(examChanges[qid].hasOwnProperty('title'))){
        examChanges[qid].title = {
            old: examJson.questions[qid+''].title
        };
    }
    if (examChanges[qid].title.old != newTitle) {
        examChanges[qid].title.new = newTitle;
    }else{
        delete examChanges[qid].title;
    }
    examJson.questions[qid + ''].title = newTitle;
    saveExam_checkChanges();
}

//{import exam/exam_QuestionAttachment.js}
//{import exam/exam_AddQuestion.js}
//{import exam/exam_AnswerTypeList.js}
//{import exam/exam_AnswerTypeModals.js}
//{import exam/exam_RemoveOrderQuestion.js}
//{import exam/exam_Save.js}
