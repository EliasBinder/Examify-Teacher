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
    examJson.questions[qid+''].quill_questionText = quill;
}

function exam_addQuestion(){
    let questionHTML = document.getElementById('exam_questionTemplate').innerHTML;
    questionHTML = questionHTML.replaceAll('%qid%', examJson.curQuestionId).trim();
    let questionTemplate = document.createElement('template');
    questionTemplate.innerHTML = questionHTML;
    document.getElementById('exam_questionsList').appendChild(questionTemplate.content.firstChild);
    examJson.questions[examJson.curQuestionId+''] = {
        title: 'Question ' + examJson.curQuestionId,
        quill_questionText: null,
        content: {},
        attachments: [],
        attachmentsCounter: 0,
        answer_types: {},
        answer_typesCounter: 0,
        answer_typesLatest: -1
    }
    initQuill(examJson.curQuestionId+'', document.getElementById(examJson.curQuestionId + '-quill-container'));
    examJson.curQuestionId ++;
    let elems = document.querySelectorAll('.dropdown-trigger');
    M.Dropdown.init(elems);
    let elems2 = document.querySelectorAll('.collapsible');
    M.Collapsible.init(elems2);
}
