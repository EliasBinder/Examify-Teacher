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
    if (previous != -1)
        examJson.questions[qid+''].answer_types[previous].nextID = id;
    examJson.questions[qid+''].answer_typesLatest = id;
    examJson.questions[qid+''].answer_typesCounter ++;
}

function exam_AType_MoveUp(qid, aID, event){
    //before moving a (order top to bottom): d b a c
    //after  moving a (order top to bottom): d a b c
    let a = examJson.questions[qid+''].answer_types[aID+''];
    if (a.previousID != -1){
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
    event.preventDefault();
    event.stopPropagation();
}

function exam_AType_MoveDown(qid, aID, event){
    //before moving a (order top to bottom): c a b d
    //after  moving a (order top to bottom): c b a d
    let a = examJson.questions[qid+''].answer_types[aID+''];
    if (a.nextID != -1){
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
    event.preventDefault();
    event.stopPropagation();
}

function exam_AType_Delete(qid, id, event){
    let entry = examJson.questions[qid+''].answer_types[id+''];
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
    event.preventDefault();
    event.stopPropagation();
}

function exam_AType_modify(qid, aid){
    console.log('Type: ' + examJson.questions[qid+''].answer_types[aid+''].type);
    if (examJson.questions[qid+''].answer_types[aid+''].type == 0){ //Text
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_text'));
        editInstance.open();
    }else if (examJson.questions[qid+''].answer_types[aid+''].type == 2){ //Multiple Choice
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_multiplechoice'));
        editInstance.open();
    }else if (examJson.questions[qid+''].answer_types[aid+''].type == 3){ //Audio Recording
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_audio'));
        editInstance.open();
    }else if (examJson.questions[qid+''].answer_types[aid+''].type == 4){ //File Upload
        let editInstance = M.Modal.getInstance(document.getElementById('exam_modal_editAnswerType_file'));
        editInstance.open();
    }
}
