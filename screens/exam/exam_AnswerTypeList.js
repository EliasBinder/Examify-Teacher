if (typeof exam_curAType !== 'undefined'){
    var exam_curAType;
}
exam_curAType = {};

if (typeof exam_clozeQuillAType !== 'undefined'){
    var exam_clozeQuillAType;
}
exam_clozeQuillAType;

if (typeof exam_multipleChoiceATypeOptions !== 'undefined'){
    var exam_multipleChoiceATypeOptions;
}
exam_multipleChoiceATypeOptions = 0;

function exam_AType_initClozeAnswerQuill() {

    var Embed = Quill.import('blots/embed');
    class QuillInput extends Embed {
        static create(value) {
            let node = super.create();
            // give it some margin
            node.type = 'text';
            node.id = value;
            node.style.display = 'inline-block';
            node.style.height = 'auto';
            node.style.width = '120px';
            node.style.fontFamily = 'Helvetica, Arial, sans-serif';
            node.style.textAlign = 'center';
            node.style.fontSize = 'inherit';
            node.setAttribute('clozeQuill_input', '1');
            return node;
        }
    }
    QuillInput.blotName = 'input'; //now you can use .ql-input classname in your toolbar
    QuillInput.tagName = 'INPUT';

    Quill.register({
        'formats/input': QuillInput
    });

    let clozeQuill = new Quill('#exam_modal_editAnswerType_cloze_quill', {
        theme: 'snow',
        placeholder: 'Type your cloze here. Use the [T] button above to insert a gap.',
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
                ['clean'],
                ['textGap']
            ]
        }
    });
    let textGapBtn = document.querySelector('.ql-textGap');
    textGapBtn.addEventListener('click', function () {
        let range = clozeQuill.getSelection();
        if (range){
            clozeQuill.insertEmbed(range.index, 'input', 'null');
        }
    });
    exam_clozeQuillAType = clozeQuill;
}
exam_AType_initClozeAnswerQuill();


function exam_addAType(qid, type){
    document.getElementById(qid + '_answer_list_row').style.removeProperty('display');
    let answerTypeHTML = document.getElementById('exam_answerTypeTemplate').innerHTML;
    let repType;
    let repName;
    if (type == 0) { //Text
        repType = 'article';
        repName = 'Text';
    }else if (type == 1){ //Cloze
        repType = 'article';
        repName = 'Cloze';
    }else if (type == 2){ //Multiple Choice
        repType = 'check_box';
        repName = 'Multiple Choice';
    }else if (type == 3){ //Audio Recording
        repType = 'mic';
        repName = 'Audio Recording';
    }else if (type == 4){ //File Upload
        repType = 'insert_drive_file'
        repName = 'File Upload';
    }
    let id = examJson.questions[qid+''].answer_typesCounter;
    answerTypeHTML = answerTypeHTML.replaceAll('%type%', repType)
        .replaceAll('%name%', repName)
        .replaceAll('%id%', id)
        .replaceAll('%qid%', qid)
        .trim();
    let answerTypeTemplate = document.createElement('template');
    answerTypeTemplate.innerHTML = answerTypeHTML;
    document.getElementById(qid + '_answer_list').appendChild(answerTypeTemplate.content.firstChild);
    let previous = (examJson.questions[qid+''].answer_typesLatest != -1) ? examJson.questions[qid+''].answer_typesLatest : -1;
    examJson.questions[qid+''].answer_types[id+''] = {
        type: type,
        content: {},
        nextID: -1,
        previousID: previous
    }
    if (type == 0){
        examJson.questions[qid+''].answer_types[id+''].content.wordlimit = -1;
    }else if (type == 3){
        examJson.questions[qid+''].answer_types[id+''].content.durationlimit = -1;
    }else if (type == 4){
        examJson.questions[qid+''].answer_types[id+''].content.numlimit = -1;
        examJson.questions[qid+''].answer_types[id+''].content.sizelimit = -1;
        examJson.questions[qid+''].answer_types[id+''].content.allowedTypes = '';
    }
    if (previous != -1)
        examJson.questions[qid+''].answer_types[previous].nextID = id;
    examJson.questions[qid+''].answer_typesLatest = id;
    examJson.questions[qid+''].answer_typesCounter ++;
}

function exam_AType_MoveUp(qid, aID, event) {
    //before moving a (order top to bottom): d b a c
    //after  moving a (order top to bottom): d a b c
    let a = examJson.questions[qid+''].answer_types[aID+''];
    if (a.previousID != -1) {
        exam_AType_MoveUp_dom(qid, aID, a);
        let atypesPos = {};
        let curAType = null;
        for (let curA of Object.keys(examJson.questions[qid+''].answer_types)) {
            if (examJson.questions[qid+''].answer_types[curA].previousID == -1) {
                curAType = curA;
                break;
            }
        }
        let atypeCounter = 0;
        while (curAType != -1) {
            atypesPos[curAType + ''] = atypeCounter;
            atypeCounter++;
            curAType = examJson.questions[qid].answer_types[curAType].nextID;
        }
        apiCall('PATCH', atypesPos, 'exam/' + exam_refID + '/questions/' + qid + '/setanswertypesposition', false, (success, data) => {
            if (!success){
                M.toast({html: 'Could not move that Answer Type'});
                exam_AType_MoveDowm_dom(qid, aID, a);
            }
        })
    }
    event.preventDefault();
    event.stopPropagation();
}

function exam_AType_MoveUp_dom(qid, aID, a){
    let bID = a.previousID;
    let b = examJson.questions[qid+''].answer_types[bID+''];

    if (a.nextID != -1){
        let cID = a.nextID;
        let c = examJson.questions[qid+''].answer_types[cID+''];
        c.previousID = bID;
        b.nextID = cID;
    }else{
        b.nextID = -1;
    }
    if (b.previousID != -1){
        let dID = b.previousID;
        let d = examJson.questions[qid+''].answer_types[dID+''];
        d.nextID = parseInt(aID);
        a.previousID = dID;
    }else{
        a.previousID = -1;
    }
    a.nextID = bID;
    b.previousID = parseInt(aID);

    let domA = document.querySelectorAll('[answerTypeId="' + aID + '"]')[0];
    let domB = document.querySelectorAll('[answerTypeId="' + bID + '"]')[0];
    domA.parentNode.insertBefore(domA, domB);
    if (examJson.questions[qid+''].answer_typesLatest == aID)
        examJson.questions[qid+''].answer_typesLatest = bID;
}

function exam_AType_MoveDown(qid, aID, event) {
    //before moving a (order top to bottom): c a b d
    //after  moving a (order top to bottom): c b a d
    let a = examJson.questions[qid+''].answer_types[aID+''];
    if (a.nextID != -1) {
        exam_AType_MoveDown_dom(qid, aID, a);
        let atypesPos = {};
        let curAType = null;
        for (let curA of Object.keys(examJson.questions[qid+''].answer_types)) {
            if (examJson.questions[qid+''].answer_types[curA].previousID == -1) {
                curAType = curA;
                break;
            }
        }
        let atypeCounter = 0;
        while (curAType != -1) {
            atypesPos[curAType + ''] = atypeCounter;
            atypeCounter++;
            curAType = examJson.questions[qid].answer_types[curAType].nextID;
        }
        apiCall('PATCH', atypesPos, 'exam/' + exam_refID + '/questions/' + qid + '/setanswertypesposition', false, (success, data) => {
            if (!success){
                M.toast({html: 'Could not move that Answer Type'});
                exam_AType_MoveUp_dom(qid, aID, a);
            }
        })
    }
    event.preventDefault();
    event.stopPropagation();
}

function exam_AType_MoveDown_dom(qid, aID, a){
    let bID = a.nextID;
    let b = examJson.questions[qid+''].answer_types[bID+''];

    if (a.previousID != -1){
        let cID = a.previousID;
        let c = examJson.questions[qid+''].answer_types[cID+''];
        c.nextID = bID;
        b.previousID = cID;
    }else{
        b.previousID = -1;
    }
    if (b.nextID != -1){
        let dID = b.nextID;
        let d = examJson.questions[qid+''].answer_types[dID+''];
        d.previousID = parseInt(aID);
        a.nextID = dID;
    }else{
        a.nextID = -1;
    }
    a.previousID = bID;
    b.nextID = parseInt(aID);

    let domA = document.querySelectorAll('[answerTypeId="' + aID + '"]')[0];
    let domB = document.querySelectorAll('[answerTypeId="' + bID + '"]')[0];
    domB.parentNode.insertBefore(domB, domA);
    if (examJson.questions[qid+''].answer_typesLatest == bID)
        examJson.questions[qid+''].answer_typesLatest = parseInt(aID);
}

function exam_AType_Delete(qid, id, event){
    event.preventDefault();
    event.stopPropagation();
    let entry = examJson.questions[qid+''].answer_types[id+''];
    if (entry.nextID == -1 && entry.previousID == -1){
        return;
    }
    if (entry.previousID != -1 && entry.nextID != -1){
        let prev = examJson.questions[qid+''].answer_types[entry.previousID+''];
        let next = examJson.questions[qid+''].answer_types[entry.nextID+''];
        prev.nextID = entry.nextID;
        next.previousID = entry.previousID;
    }else if (entry.previousID != -1){
        if (entry.nextID == -1){
            examJson.questions[qid+''].answer_typesLatest = entry.previousID;
        }
        let prev = examJson.questions[qid+''].answer_types[entry.previousID+''];
        prev.nextID = -1;
    }else if (entry.nextID != -1){
        let next = examJson.questions[qid+''].answer_types[entry.nextID+''];
        next.previousID = -1;
    }else{
        examJson.questions[qid+''].answer_typesCounter = 0;
        examJson.questions[qid+''].answer_typesLatest = -1;
        document.getElementById(qid + '_answer_list_row').style.display = 'none';
    }
    delete examJson.questions[qid+''].answer_types[id+''];
    let dom = document.querySelectorAll('[answerTypeId="' + id + '"]')[0];
    dom.parentNode.removeChild(dom);
}

function exam_AType_modify(qid, aid){
    exam_curAType.aid = aid;
    exam_curAType.qid = qid;
    if (examJson.questions[qid+''].answer_types[aid+''].type == 0) { //Text
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_text'));
        let wordlimit = examJson.questions[qid + ''].answer_types[aid + ''].content.wordlimit;
        if (wordlimit == -1) {
            document.getElementById('exam_modal_editAnswerType_text_limit_checkbox').checked = false;
            document.getElementById('exam_modal_editAnswerType_text_limit_numberinput').style.display = 'none';
            document.getElementById('exam_modal_editAnswerType_text_limit').value = '100';
        } else {
            document.getElementById('exam_modal_editAnswerType_text_limit_checkbox').checked = true;
            document.getElementById('exam_modal_editAnswerType_text_limit_numberinput').style.display = 'block';
            document.getElementById('exam_modal_editAnswerType_text_limit').value = wordlimit;
        }
        editInstance.open();
    }else if (examJson.questions[qid+''].answer_types[aid+''].type == 1){ //Cloze
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_cloze'));
        exam_clozeQuillAType.setContents(new Delta(examJson.questions[qid + ''].answer_types[aid + ''].content.pattern));
        let inputs = document.querySelectorAll('[clozeQuill_input = "1"]');
        let solution = examJson.questions[qid + ''].answer_types[aid + ''].content.solution;
        for (let i = 0; i < inputs.length; i++){
            inputs[i].value = solution[i];
        }
        editInstance.open();
    }else if (examJson.questions[qid+''].answer_types[aid+''].type == 2){ //Multiple Choice
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_multiplechoice'));
        if (Array.isArray(examJson.questions[qid + ''].answer_types[aid + ''].content.options)) {
            exam_AType_multipleChoice_setOptions(examJson.questions[qid + ''].answer_types[aid + ''].content.options);
        }else{
            exam_AType_multipleChoice_setOptions([]);
            exam_AType_multipleChoice_addOption();
        }
        editInstance.open();
    }else if (examJson.questions[qid+''].answer_types[aid+''].type == 3){ //Audio Recording
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_audio'));
        let durationLimit = examJson.questions[qid + ''].answer_types[aid + ''].content.durationlimit;
        if (durationLimit == -1) {
            document.getElementById('exam_modal_editAnswerType_audio_limit_checkbox').checked = false;
            document.getElementById('exam_modal_editAnswerType_audio_limit_numberinput').style.display = 'none';
            document.getElementById('exam_modal_editAnswerType_audio_limit').value = '';
        } else {
            document.getElementById('exam_modal_editAnswerType_audio_limit_checkbox').checked = true;
            document.getElementById('exam_modal_editAnswerType_audio_limit_numberinput').style.display = 'block';
            document.getElementById('exam_modal_editAnswerType_audio_limit').value = durationLimit;
        }
        editInstance.open();
    }else if (examJson.questions[qid+''].answer_types[aid+''].type == 4){ //File Upload
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_file'));
        let numberLimit = examJson.questions[qid + ''].answer_types[aid + ''].content.numlimit;
        if (numberLimit == -1) {
            document.getElementById('exam_modal_editAnswerType_file_limit_number_checkbox').checked = false;
            document.getElementById('exam_modal_editAnswerType_file_limit_number_numberinput').style.display = 'none';
            document.getElementById('exam_modal_editAnswerType_file_limit_number').value = '';
        } else {
            document.getElementById('exam_modal_editAnswerType_file_limit_number_checkbox').checked = true;
            document.getElementById('exam_modal_editAnswerType_file_limit_number_numberinput').style.display = 'block';
            document.getElementById('exam_modal_editAnswerType_file_limit_number').value = numberLimit;
        }
        let sizeLimit = examJson.questions[qid + ''].answer_types[aid + ''].content.sizelimit;
        if (sizeLimit == -1) {
            document.getElementById('exam_modal_editAnswerType_file_limit_size_checkbox').checked = false;
            document.getElementById('exam_modal_editAnswerType_file_limit_size_numberinput').style.display = 'none';
            document.getElementById('exam_modal_editAnswerType_file_limit_size').value = '';
        } else {
            document.getElementById('exam_modal_editAnswerType_file_limit_size_checkbox').checked = true;
            document.getElementById('exam_modal_editAnswerType_file_limit_size_numberinput').style.display = 'block';
            document.getElementById('exam_modal_editAnswerType_file_limit_size').value = sizeLimit;
        }
        let types = examJson.questions[qid + ''].answer_types[aid + ''].content.allowedTypes;
        if (numberLimit == -1) {
            document.getElementById('exam_modal_editAnswerType_file_spectypes_checkbox').checked = false;
            document.getElementById('exam_modal_editAnswerType_file_spectypes_numberinput').style.display = 'none';
            document.getElementById('exam_modal_editAnswerType_file_spectypes').value = '';
        } else {
            document.getElementById('exam_modal_editAnswerType_file_spectypes_checkbox').checked = true;
            document.getElementById('exam_modal_editAnswerType_file_spectypes_numberinput').style.display = 'block';
            document.getElementById('exam_modal_editAnswerType_file_spectypes').value = types;
        }
        editInstance.open();
    }
}
