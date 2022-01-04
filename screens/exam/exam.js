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
    questions: {}
};



function exam_updateQTitle(qid, newTitle){
    newTitle = newTitle.trim();
    document.getElementById(qid + '_question_title').innerHTML = '<i class="material-icons">assignment</i>' + newTitle;
    examJson.questions[qid + ''].title = newTitle;
}

//{import exam/exam_QuestionAttachment.js}
//{import exam/exam_AddQuestion.js}
//{import exam/exam_AnswerTypeList.js}
//{import exam/exam_AnswerTypeModals.js}


//if a new exam has to be created: Add first question
if (typeof exam_refType !== 'undefined'){
    if (exam_refType == 0) //create a new exam
        exam_addQuestion();
}
