if (typeof exam_currentAType === 'undefined'){
    var exam_currentAType;
}
exam_currentAType = {};

if (typeof exam_quill_clozeModal === 'undefined'){
    var exam_quill_clozeModal;
}
exam_quill_clozeModal;

if (typeof exam_multipleChoice_modal_numberOfOptions === 'undefined'){
    var exam_multipleChoice_modal_numberOfOptions;
}
exam_multipleChoice_modal_numberOfOptions = 0;

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
        readOnly: function () {
            return !examJson.editable;
        }(),
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
    exam_quill_clozeModal = clozeQuill;
}
exam_AType_initClozeAnswerQuill();


function exam_AType_modify(qid, aid){
    exam_currentAType.aid = aid;
    exam_currentAType.qid = qid;
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
        exam_quill_clozeModal.setContents(new Delta(examJson.questions[qid + ''].answer_types[aid + ''].content.pattern));
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


function exam_modal_editAnswerType_text_limit_toggle() {
    let domNumInput = document.getElementById('exam_modal_editAnswerType_text_limit_numberinput');
    if (domNumInput.style.display == 'block'){
        domNumInput.style.display = 'none';
    }else{
        domNumInput.style.display = 'block';
    }
}

function exam_modal_editAnswerType_audio_limit_toggle() {
    let domNumInput = document.getElementById('exam_modal_editAnswerType_audio_limit_numberinput');
    if (domNumInput.style.display == 'block'){
        domNumInput.style.display = 'none';
    }else{
        domNumInput.style.display = 'block';
    }
}

function exam_modal_editAnswerType_file_limit_number_toggle() {
    let domNumInput = document.getElementById('exam_modal_editAnswerType_file_limit_number_numberinput');
    if (domNumInput.style.display == 'block'){
        domNumInput.style.display = 'none';
    }else{
        domNumInput.style.display = 'block';
    }
}

function exam_modal_editAnswerType_file_limit_size_toggle() {
    let domNumInput = document.getElementById('exam_modal_editAnswerType_file_limit_size_numberinput');
    if (domNumInput.style.display == 'block'){
        domNumInput.style.display = 'none';
    }else{
        domNumInput.style.display = 'block';
    }
}

function exam_modal_editAnswerType_file_spectypes_toggle() {
    let domNumInput = document.getElementById('exam_modal_editAnswerType_file_spectypes_numberinput');
    if (domNumInput.style.display == 'block'){
        domNumInput.style.display = 'none';
    }else{
        domNumInput.style.display = 'block';
    }
}


function exam_AType_multipleChoice_addOption() {
    exam_multipleChoice_modal_numberOfOptions ++;
    let optionHTML = document.getElementById('exam_modal_editAnswerType_multiplechoice_option').innerHTML;
    optionHTML = optionHTML.replaceAll('%id%', exam_multipleChoice_modal_numberOfOptions).trim();
    let optionTemplate = document.createElement('template');
    optionTemplate.innerHTML = optionHTML;
    document.getElementById('exam_modal_editAnswerType_multiplechoice_addOptionRow').parentNode.insertBefore(optionTemplate.content.firstChild, document.getElementById('exam_modal_editAnswerType_multiplechoice_addOptionRow'));
}

function exam_AType_multipleChoice_setOptions(options) {
    exam_multipleChoice_modal_numberOfOptions = 0;
    let curDOMoptions = document.querySelectorAll('[multipleChoiceOption = "1"]');
    for (let option of curDOMoptions){
        option.parentNode.removeChild(option);
    }
    for (let option of options){
        exam_AType_multipleChoice_addOption();
        document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoice_modal_numberOfOptions + '_value').value = option.value;
        document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoice_modal_numberOfOptions + '_isCorrect').checked = option.isCorrect;
        if (!examJson.editable){
            document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoice_modal_numberOfOptions + '_value').disabled = true;
            document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoice_modal_numberOfOptions + '_isCorrect').disabled = true;
        }
    }
}



function exam_AType_updateTextAnswer() {
    if (document.getElementById('exam_modal_editAnswerType_text_limit_checkbox').checked) {
        let newWordLimit = parseInt(document.getElementById('exam_modal_editAnswerType_text_limit').value);
        if (newWordLimit > 0) {
            examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.wordlimit = newWordLimit;
        }else{
            M.toast({html: 'Invalid Word Limit!'});
        }
    }else{
        examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.wordlimit = -1;
    }
    exam_AType_upload(exam_currentAType.qid, exam_currentAType.aid);
}

function exam_AType_updateClozeAnswer() {
    let inputs = document.querySelectorAll('[clozeQuill_input = "1"]');
    let solution = [];
    for (let input of inputs){
        solution.push(input.value);
    }
    examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.pattern = exam_quill_clozeModal.getContents().ops;
    examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.solution = solution;
    exam_AType_upload(exam_currentAType.qid, exam_currentAType.aid);
}

function exam_AType_updateMultipleChoiceAnswer() {
    let options = [];
    for (let i = 1; i <= exam_multipleChoice_modal_numberOfOptions; i++){
        if (document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + i + '_value').value.trim().length > 0) {
            options.push({
                value: document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + i + '_value').value,
                isCorrect: document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + i + '_isCorrect').checked
            });
        }
    }
    examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.options = options;
    exam_AType_upload(exam_currentAType.qid, exam_currentAType.aid);
}

function exam_AType_updateAudioAnswer() {
    if (document.getElementById('exam_modal_editAnswerType_audio_limit_checkbox').checked) {
        let newDurationLimit = parseInt(document.getElementById('exam_modal_editAnswerType_audio_limit').value);
        if (newDurationLimit > 0) {
            examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.durationlimit = newDurationLimit;
        }else{
            M.toast({html: 'Invalid Duration Limit!'});
        }
    }else{
        examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.durationlimit = -1;
    }
    exam_AType_upload(exam_currentAType.qid, exam_currentAType.aid);
}

function exam_AType_updateFileAnswer() {
    if (document.getElementById('exam_modal_editAnswerType_file_limit_number_checkbox').checked) {
        let newNumberLimit = parseInt(document.getElementById('exam_modal_editAnswerType_file_limit_number').value);
        if (newNumberLimit > 0) {
            examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.numlimit = newNumberLimit;
        }else{
            M.toast({html: 'Invalid Number Of Files Limit!'});
        }
    }else{
        examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.numlimit = -1;
    }
    if (document.getElementById('exam_modal_editAnswerType_file_limit_size_checkbox').checked) {
        let newSizeLimit = parseInt(document.getElementById('exam_modal_editAnswerType_file_limit_size').value);
        if (newSizeLimit > 0) {
            examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.sizelimit = newSizeLimit;
        }else{
            M.toast({html: 'Invalid File Size Limit!'});
        }
    }else{
        examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.sizelimit = -1;
    }
    if (document.getElementById('exam_modal_editAnswerType_file_spectypes_checkbox').checked) {
        let newTypes = document.getElementById('exam_modal_editAnswerType_file_spectypes').value;
        examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.allowedTypes = newTypes;
    }else{
        examJson.questions[exam_currentAType.qid + ''].answer_types[exam_currentAType.aid + ''].content.allowedTypes = '';
    }
    exam_AType_upload(exam_currentAType.qid, exam_currentAType.aid);
}

function exam_AType_upload(qid, aid) {
    apiCall('PATCH', examJson.questions[qid + ''].answer_types[aid + ''].content, 'exam/' + exam_referenceID + '/questions/' + qid + '/answertypes/' + aid + '/setproperties', false, (success, data) => {
        if (!success){
            M.toast({html: 'Could not upload that answer type modifications!'});
        }
    });
}
