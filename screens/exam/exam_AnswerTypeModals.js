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
    exam_multipleChoiceATypeOptions ++;
    let optionHTML = document.getElementById('exam_modal_editAnswerType_multiplechoice_option').innerHTML;
    optionHTML = optionHTML.replaceAll('%id%', exam_multipleChoiceATypeOptions).trim(); //TODO
    let optionTemplate = document.createElement('template');
    optionTemplate.innerHTML = optionHTML;
    document.getElementById('exam_modal_editAnswerType_multiplechoice_addOptionRow').parentNode.insertBefore(optionTemplate.content.firstChild, document.getElementById('exam_modal_editAnswerType_multiplechoice_addOptionRow'));
}

function exam_AType_multipleChoice_setOptions(options) {
    exam_multipleChoiceATypeOptions = 0;
    let curDOMoptions = document.querySelectorAll('[multipleChoiceOption = "1"]');
    for (let option of curDOMoptions){
        option.parentNode.removeChild(option);
    }
    for (let option of options){
        exam_AType_multipleChoice_addOption();
        document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoiceATypeOptions + '_value').value = option.value;
        document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoiceATypeOptions + '_isCorrect').checked = option.isCorrect;
        if (!examJson.editable){
            document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoiceATypeOptions + '_value').disabled = true;
            document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + exam_multipleChoiceATypeOptions + '_isCorrect').disabled = true;
        }
    }
}



function exam_AType_updateTextAnswer() {
    if (document.getElementById('exam_modal_editAnswerType_text_limit_checkbox').checked) {
        let newWordLimit = parseInt(document.getElementById('exam_modal_editAnswerType_text_limit').value);
        if (newWordLimit > 0) {
            examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.wordlimit = newWordLimit;
        }else{
            M.toast({html: 'Invalid Word Limit!'});
        }
    }else{
        examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.wordlimit = -1;
    }
    exam_AType_upload(exam_curAType.qid, exam_curAType.aid);
}

function exam_AType_updateClozeAnswer() {
    let inputs = document.querySelectorAll('[clozeQuill_input = "1"]');
    let solution = [];
    for (let input of inputs){
        solution.push(input.value);
    }
    examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.pattern = exam_clozeQuillAType.getContents().ops;
    examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.solution = solution;
    exam_AType_upload(exam_curAType.qid, exam_curAType.aid);
}

function exam_AType_updateMultipleChoiceAnswer() {
    let options = [];
    for (let i = 1; i <= exam_multipleChoiceATypeOptions; i++){
        if (document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + i + '_value').value.trim().length > 0) {
            options.push({
                value: document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + i + '_value').value,
                isCorrect: document.getElementById('exam_modal_editAnswerType_multiplechoice_option_' + i + '_isCorrect').checked
            });
        }
    }
    examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.options = options;
    exam_AType_upload(exam_curAType.qid, exam_curAType.aid);
}

function exam_AType_updateAudioAnswer() {
    if (document.getElementById('exam_modal_editAnswerType_audio_limit_checkbox').checked) {
        let newDurationLimit = parseInt(document.getElementById('exam_modal_editAnswerType_audio_limit').value);
        if (newDurationLimit > 0) {
            examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.durationlimit = newDurationLimit;
        }else{
            M.toast({html: 'Invalid Duration Limit!'});
        }
    }else{
        examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.durationlimit = -1;
    }
    exam_AType_upload(exam_curAType.qid, exam_curAType.aid);
}

function exam_AType_updateFileAnswer() {
    if (document.getElementById('exam_modal_editAnswerType_file_limit_number_checkbox').checked) {
        let newNumberLimit = parseInt(document.getElementById('exam_modal_editAnswerType_file_limit_number').value);
        if (newNumberLimit > 0) {
            examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.numlimit = newNumberLimit;
        }else{
            M.toast({html: 'Invalid Number Of Files Limit!'});
        }
    }else{
        examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.numlimit = -1;
    }
    if (document.getElementById('exam_modal_editAnswerType_file_limit_size_checkbox').checked) {
        let newSizeLimit = parseInt(document.getElementById('exam_modal_editAnswerType_file_limit_size').value);
        if (newSizeLimit > 0) {
            examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.sizelimit = newSizeLimit;
        }else{
            M.toast({html: 'Invalid File Size Limit!'});
        }
    }else{
        examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.sizelimit = -1;
    }
    if (document.getElementById('exam_modal_editAnswerType_file_spectypes_checkbox').checked) {
        let newTypes = document.getElementById('exam_modal_editAnswerType_file_spectypes').value;
        examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.allowedTypes = newTypes;
    }else{
        examJson.questions[exam_curAType.qid + ''].answer_types[exam_curAType.aid + ''].content.allowedTypes = '';
    }
    exam_AType_upload(exam_curAType.qid, exam_curAType.aid);
}

function exam_AType_upload(qid, aid) {
    apiCall('PATCH', examJson.questions[qid + ''].answer_types[aid + ''].content, 'exam/' + exam_refID + '/questions/' + qid + '/answertypes/' + aid + '/setproperties', false, (success, data) => {
        if (!success){
            M.toast({html: 'Could not upload that answer type modifications!'});
        }
    });
}
