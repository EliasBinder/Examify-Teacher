if (typeof AnswerTypesMap === 'undefined'){
    var AnswerTypesMap;
}
AnswerTypesMap = [
    {
        repType: 'article',
        repName: 'Text'
    }, {
        repType: 'article',
        repName: 'Cloze'
    }, {
        repType: 'check_box',
        repName: 'Multiple Choice'
    }, {
        repType: 'mic',
        repName: 'Audio Recording'
    }, {
        repType: 'insert_drive_file',
        repName: 'File Upload'
    }
]


function exam_addAType(qid, type){
    document.getElementById(qid + '_answer_list_row').style.removeProperty('display');
    let answerTypeHTML = document.getElementById('exam_answerTypeTemplate').innerHTML;
    let repType = AnswerTypesMap[type].repType;
    let repName = AnswerTypesMap[type].repName;
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

function exam_importAType(qid, id) {
    let answerType = examJson.questions[qid].answer_types[id];
    document.getElementById(qid + '_answer_list_row').style.removeProperty('display');
    let answerTypeHTML = document.getElementById('exam_answerTypeTemplate').innerHTML;
    let repType = AnswerTypesMap[answerType.type].repType;
    let repName = AnswerTypesMap[answerType.type].repName;
    answerTypeHTML = answerTypeHTML.replaceAll('%type%', repType)
        .replaceAll('%name%', repName)
        .replaceAll('%id%', id)
        .replaceAll('%qid%', qid)
        .trim();
    let answerTypeTemplate = document.createElement('template');
    answerTypeTemplate.innerHTML = answerTypeHTML;
    document.getElementById(qid + '_answer_list').appendChild(answerTypeTemplate.content.firstChild);
    if (answerType.nextID != -1)
        exam_importAType(qid, answerType.nextID);
}

function linkATypes(qid) {
    let prevID = -1;
    let firstID;
    examJson.questions[qid].answer_typesCounter = Object.keys(examJson.questions[qid].answer_types).length;
    for (let i = 1; i <= examJson.questions[qid].answer_typesCounter; i++) {
        for (let answerTypeID of Object.keys(examJson.questions[qid].answer_types)) {
            let answerType = examJson.questions[qid].answer_types[answerTypeID];
            if (answerType.pos == i) {
                if (i == 1) {
                    firstID = answerTypeID;
                }
                examJson.questions[qid].answer_types[answerTypeID].previousID = prevID;
                examJson.questions[qid].answer_types[answerTypeID].nextID = -1;
                if (prevID != -1) {
                    examJson.questions[qid].answer_types[prevID].nextID = qid;
                }
                prevID = answerTypeID;
                if (i == examJson.questions[qid].answer_typesCounter) {
                    examJson.questions[qid].answer_typesLatest = parseInt(answerTypeID);
                }
            }
        }
    }
    return firstID;
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
        apiCall('PATCH', atypesPos, 'exam/' + exam_referenceID + '/questions/' + qid + '/setanswertypesposition', false, (success, data) => {
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
        apiCall('PATCH', atypesPos, 'exam/' + exam_referenceID + '/questions/' + qid + '/setanswertypesposition', false, (success, data) => {
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
