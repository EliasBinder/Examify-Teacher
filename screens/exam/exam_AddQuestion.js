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
    let elems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elems);
    let elems2 = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems2);
}
