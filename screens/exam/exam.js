//{import overlay/template/navigation.js}
//{import ../resources/QuillJs/script.js}
domLoadListenerAdd(() => {
    let elems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elems);
    let elems2 = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems2);
    let elems3 = document.querySelectorAll('.materialboxed');
    M.Materialbox.init(elems3);
    M.Modal.init(document.getElementById('exam_modal_preview_img'));
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


//if a new exam has to be created: Add first question
if (typeof exam_refType !== 'undefined'){
    if (exam_refType == 0) //create a new exam
        exam_addQuestion();
}
