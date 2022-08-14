//{import overlay/template/navigation.js}
//{import ../resources/QuillJs/script.js}
if (typeof Delta === 'undefined'){
    var Delta;
}
Delta = Quill.import('delta');

//Initialize MaterializeCss components
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
    M.Modal.init(document.querySelectorAll('#exam_modal_editAnswerType_text'), {
        onCloseStart: () => {
            exam_AType_updateTextAnswer();
        }
    });
    M.Modal.init(document.querySelectorAll('#exam_modal_editAnswerType_cloze'), {
        onCloseStart: () => {
            exam_AType_updateClozeAnswer();
        }
    });
    M.Modal.init(document.querySelectorAll('#exam_modal_editAnswerType_multiplechoice'), {
        onCloseStart: () => {
            exam_AType_updateMultipleChoiceAnswer();
        }
    });
    M.Modal.init(document.querySelectorAll('#exam_modal_editAnswerType_audio'), {
        onCloseStart: () => {
            exam_AType_updateAudioAnswer();
        }
    });
    M.Modal.init(document.querySelectorAll('#exam_modal_editAnswerType_file'), {
        onCloseStart: () => {
            exam_AType_updateFileAnswer();
        }
    })
    M.Modal.init(document.querySelectorAll('.modal.mautoinit'));
});


if (typeof examJson === 'undefined'){
    var examJson;
}
examJson = {
    title: '',
    editable: true,
    curQuestionId: 1,
    latestQuestionId: -1,
    questions: {}
};

if (typeof examChanges === 'undefined'){
    var examChanges;
}
examChanges = {};

/**
 * Get exam content/data from backend
 */
function retreiveExamPackage(){
    apiCall('GET', null, 'exam/' + exam_referenceID + '/getpackage', false, (success, json) => {
        if (success) {
            examJson = json;
            document.getElementById('exam_title').innerText = json.title;
            if (!examJson.editable){
                document.getElementById('editableStyle').innerText = '.editable { display: none !important }';
                document.getElementById('exam_modal_editAnswerType_text_limit_checkbox').disabled = true;
                document.getElementById('exam_modal_editAnswerType_text_limit').disabled = true;
                document.getElementById('exam_modal_editAnswerType_audio_limit_checkbox').disabled = true;
                document.getElementById('exam_modal_editAnswerType_audio_limit').disabled = true;
                document.getElementById('exam_modal_editAnswerType_file_limit_number_checkbox').disabled = true;
                document.getElementById('exam_modal_editAnswerType_file_limit_number').disabled = true;
                document.getElementById('exam_modal_editAnswerType_file_limit_size_checkbox').disabled = true;
                document.getElementById('exam_modal_editAnswerType_file_limit_size').disabled = true;
                document.getElementById('exam_modal_editAnswerType_file_spectypes_checkbox').disabled = true;
                document.getElementById('exam_modal_editAnswerType_file_spectypes_numberinput').disabled = true;
            }
            let firstQuestion = linkQuestions();
            importQuestion(firstQuestion);
        }else
            M.toast({html: 'Could not download the exam!'});
    });
}
retreiveExamPackage();


/**
 * Update the title of a question
 * @param qid question id
 * @param newTitle new question title
 */
function exam_updateQTitle(qid, newTitle){
    newTitle = newTitle.trim();
    document.getElementById(qid + '_question_title').innerHTML = '<i class="material-icons left">assignment</i>' +
        newTitle +
        '<i class="material-icons secondary-content-collapsible red-text editable" onclick="exam_removeQuestion(event, \'%qid%\')">delete</i></a>' +
        '<i class="material-icons secondary-content-collapsible blue-text editable" onclick="exam_moveQuestion_up(event, \'%qid%\')" style="right: 35px">arrow_upward</i>' +
        '<i class="material-icons secondary-content-collapsible blue-text editable" onclick="exam_moveQuestion_down(event, \'%qid%\')" style="right: 60px">arrow_downward</i>';
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
