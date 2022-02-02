function initQuill(qid, container) {
    let quill = new Quill(container, {
        theme: 'snow',
        placeholder: 'Type your question here...',
        modules: {
            toolbar: [
                [{ 'size': ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [
                    { 'color': [] },
                    { 'background': [] }
                ],
                ['link', 'blockquote', 'code-block'],
                [
                    { 'list': 'ordered' },
                    { 'list': 'bullet' }
                ],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    });
    quill.on('text-change', function (delta, oldContents, source) {
        let newContent = quill.getContents().ops;
        if (!(examChanges.hasOwnProperty(qid))) {
            examChanges[qid] = {};
        }
        if (!(examChanges[qid].hasOwnProperty('content'))){
            examChanges[qid].content = {
                old: examJson.questions[qid+''].content
            };
        }
        if (JSON.stringify(examChanges[qid].content.old) != JSON.stringify(newContent)) {
            examChanges[qid].content.new = newContent;
        }else{
            delete examChanges[qid].content;
        }
        examJson.questions[qid+''].content = newContent;
        saveExam_checkChanges();
    });
    examJson.questions[qid+''].quill_questionText = quill;
}

function exam_addQuestion(){
    let questionHTML = document.getElementById('exam_questionTemplate').innerHTML;
    questionHTML = questionHTML.replaceAll('%qid%', examJson.curQuestionId).trim();
    let questionTemplate = document.createElement('template');
    questionTemplate.innerHTML = questionHTML;
    document.getElementById('exam_questionsList').appendChild(questionTemplate.content.firstChild);
    let previous = (examJson.latestQuestionId != -1) ? examJson.latestQuestionId : -1;
    examJson.questions[examJson.curQuestionId+''] = {
        title: 'Question ' + examJson.curQuestionId,
        quill_questionText: null,
        content: [{
            insert: "\n"
        }],
        attachments: [],
        attachmentsCounter: 0,
        answer_types: {},
        answer_typesCounter: 0,
        answer_typesLatest: -1,
        nextID: -1,
        previousID: previous
    };
    if (previous != -1)
        examJson.questions[examJson.latestQuestionId+''].nextID = examJson.curQuestionId;
    initQuill(examJson.curQuestionId+'', document.getElementById(examJson.curQuestionId + '-quill-container'));
    examJson.latestQuestionId = examJson.curQuestionId;
    examJson.curQuestionId ++;
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
}

function importQuestion(id) {
    let questionHTML = document.getElementById('exam_questionTemplate').innerHTML;
    questionHTML = questionHTML.replaceAll('%qid%', id).trim();
    let questionTemplate = document.createElement('template');
    questionTemplate.innerHTML = questionHTML;
    document.getElementById('exam_questionsList').appendChild(questionTemplate.content.firstChild);
    examJson.questions[id].attachmentsCounter = examJson.questions[id].attachments.length;
    examJson.questions[id].answer_typesCounter = Object.keys(examJson.questions[id].answer_types).length;
    initQuill(id+'', document.getElementById(id + '-quill-container'));
    examJson.questions[id].quill_questionText.setContents(new Delta(examJson.questions[id].content));
    M.Dropdown.init(document.querySelectorAll('.dropdown-trigger'));
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
    for (let attachmentid = 0; attachmentid < examJson.questions[id].attachmentsCounter; attachmentid++){
        exam_importQAttachment(id, attachmentid);
    }
}

function linkQuestions() {
    let prevID = -1;
    examJson.curQuestionId = Object.keys(examJson.questions).length + 1;
    for (let i = 1; i < examJson.curQuestionId; i++) {
        for (let qid of Object.keys(examJson.questions)) {
            if (examJson.questions[qid].pos == i) {
                examJson.questions[qid].previousID = prevID;
                examJson.questions[qid].nextID = -1;
                if (prevID != -1) {
                    examJson.questions[prevID].nextID = qid;
                }
                prevID = qid;
                if (i == examJson.curQuestionId - 1){ // FIX
                    examJson.latestQuestionId = parseInt(qid);
                }
            }
        }
    }
}
