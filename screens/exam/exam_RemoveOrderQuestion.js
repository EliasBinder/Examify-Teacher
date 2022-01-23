if (typeof curActionQuestionID === 'undefined')
    var curActionQuestionID;
curActionQuestionID = -1;

function exam_removeQuestion(event, qid) {
    event.stopPropagation();
    let questionTitle = examJson.questions[qid+''].title;
    document.getElementById('exam_modal_deleteQuestion_body').innerText = 'Are you sure that you want to delete the question \'' + questionTitle + '\'?';
    curActionQuestionID = qid;
    let confirmModal = M.Modal.getInstance(document.getElementById('exam_modal_deleteQuestion'));
    confirmModal.open();
}

function exam_removeQuestion_confirm() {
    apiCall('DELETE', null, 'exam/' + exam_refID + '/questions/' + curActionQuestionID, false, (success, data) => {
        if (success){
            let entry = examJson.questions[curActionQuestionID+''];
            if (entry.previousID != -1 && entry.nextID != -1){
                let prev = examJson.questions[entry.previousID];
                let next = examJson.questions[entry.nextID];
                prev.nextID = entry.nextID;
                next.previousID = entry.previousID;
            }else if (entry.previousID != -1){
                if (entry.nextID == -1){
                    examJson.latestQuestionId = entry.previousID;
                }
                let prev = examJson.questions[entry.previousID];
                prev.nextID = -1;
            }else if (entry.nextID != -1){
                let next = examJson.questions[entry.nextID];
                next.previousID = -1;
            }
            delete examJson.questions[curActionQuestionID+''];
            let qListItem = document.getElementById(curActionQuestionID + '_question');
            qListItem.parentElement.removeChild(qListItem);
        }else{
            M.toast({html: 'Could not delete that question!'});
        }
    });
}

function exam_moveQuestion_down(event, aID) {
    //before moving a (order top to bottom): c a b d
    //after  moving a (order top to bottom): c b a d
    let a = examJson.questions[aID + ''];
    if (a.nextID != -1) {
        exam_moveQuestion_down_dom(aID, a);
        let questionPos = {};
        let curQuestion = null;
        for (let qid of Object.keys(examJson.questions)) {
            if (examJson.questions[qid].previousID == -1) {
                curQuestion = qid;
                break;
            }
        }
        let questionCounter = 0;
        while (curQuestion != -1) {
            questionPos[curQuestion + ''] = questionCounter;
            questionCounter++;
            curQuestion = examJson.questions[curQuestion].nextID;
        }
        apiCall('PATCH', questionPos, 'exam/' + exam_refID + '/setquestionsposition', false, (success, data) => {
            if (!success) {
                M.toast({html: 'Could not move that question!'});
                exam_moveQuestion_up_dom(aID, a);
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}

function exam_moveQuestion_down_dom(aID, a) {
    let bID = a.nextID;
    let b = examJson.questions[bID + ''];

    if (a.previousID != -1) {
        let cID = a.previousID;
        let c = examJson.questions[cID + ''];
        c.nextID = bID;
        b.previousID = cID;
    } else {
        b.previousID = -1;
    }
    if (b.nextID != -1) {
        let dID = b.nextID;
        let d = examJson.questions[dID + ''];
        d.previousID = parseInt(aID);
        a.nextID = dID;
    } else {
        a.nextID = -1;
    }
    a.previousID = bID;
    b.nextID = parseInt(aID);

    let domA = document.getElementById(aID + '_question');
    let domB = document.getElementById(bID + '_question');
    domB.parentNode.insertBefore(domB, domA);
    if (examJson.latestQuestionId == bID)
        examJson.latestQuestionId = parseInt(aID);
}

function exam_moveQuestion_up(event, aID) {
    //before moving a (order top to bottom): d b a c
    //after  moving a (order top to bottom): d a b c
    let a = examJson.questions[aID+''];
    if (a.previousID != -1){
        exam_moveQuestion_up_dom(aID, a);
        let questionPos = {};
        let curQuestion = null;
        for (let qid of Object.keys(examJson.questions)) {
            if (examJson.questions[qid].previousID == -1) {
                curQuestion = qid;
                break;
            }
        }
        let questionCounter = 0;
        while (curQuestion != -1) {
            questionPos[curQuestion + ''] = questionCounter;
            questionCounter++;
            curQuestion = examJson.questions[curQuestion].nextID;
        }
        apiCall('PATCH', questionPos, 'exam/' + exam_refID + '/setquestionsposition', false, (success, data) => {
            if (!success) {
                M.toast({html: 'Could not move that question!'});
                exam_moveQuestion_down_dom(aID, a);
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}

function exam_moveQuestion_up_dom(aID, a) {
    let bID = a.previousID;
    let b = examJson.questions[bID+''];

    if (a.nextID != -1){
        let cID = a.nextID;
        let c = examJson.questions[cID+''];
        c.previousID = bID;
        b.nextID = cID;
    }else{
        b.nextID = -1;
    }
    if (b.previousID != -1){
        let dID = b.previousID;
        let d = examJson.questions[dID+''];
        d.nextID = parseInt(aID);
        a.previousID = dID;
    }else{
        a.previousID = -1;
    }
    a.nextID = bID;
    b.previousID = parseInt(aID);

    let domA = document.getElementById(aID + '_question');
    let domB = document.getElementById(bID + '_question');
    domA.parentNode.insertBefore(domA, domB);
    if (examJson.latestQuestionId == aID)
        examJson.latestQuestionId = bID;
}
