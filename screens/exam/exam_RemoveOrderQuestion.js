if (typeof exam_currentQuestionID === 'undefined')
    var exam_currentQuestionID;
exam_currentQuestionID = -1;

/**
 * remove a question from the exam -> open dialog to confirm
 * @param event event to be cancelled
 * @param qid question id to be removed
 */
function exam_removeQuestion(event, qid) {
    event.stopPropagation();
    if (Object.keys(examJson.questions).length == 1){
        return;
    }
    let questionTitle = examJson.questions[qid+''].title;
    document.getElementById('exam_modal_deleteQuestion_body').innerText = 'Are you sure that you want to delete the question \'' + questionTitle + '\'?';
    exam_currentQuestionID = qid;
    let confirmModal = M.Modal.getInstance(document.getElementById('exam_modal_deleteQuestion'));
    confirmModal.open();
}

/**
 * clicking confirm on the "Do you really want to delete that question" dialog -> question gets finally deleted
 */
function exam_removeQuestion_confirm() {
    apiCall('DELETE', null, 'exam/' + exam_referenceID + '/questions/' + exam_currentQuestionID, false, (success, data) => {
        if (success){
            let entry = examJson.questions[exam_currentQuestionID+''];
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
            delete examJson.questions[exam_currentQuestionID+''];
            let qListItem = document.getElementById(exam_currentQuestionID + '_question');
            qListItem.parentElement.removeChild(qListItem);
        }else{
            M.toast({html: 'Could not delete that question!'});
        }
    });
}

/**
 * move a question downwards
 * @param event event to be cancelled
 * @param qID questionid
 */
function exam_moveQuestion_down(event, qID) {
    //before moving q (order top to bottom): c q b d
    //after  moving q (order top to bottom): c b q d
    let q = examJson.questions[qID + ''];
    if (q.nextID != -1) {
        exam_moveQuestion_down_dom(qID, q);
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
        apiCall('PATCH', questionPos, 'exam/' + exam_referenceID + '/setquestionsposition', false, (success, data) => {
            if (!success) {
                M.toast({html: 'Could not move that question!'});
                exam_moveQuestion_up_dom(qID, q);
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}

/**
 * move DOM content of q question downwards
 * @param qID question id
 * @param q examJson reference to the the question
 */
function exam_moveQuestion_down_dom(qID, q) {
    let bID = q.nextID;
    let b = examJson.questions[bID + ''];

    if (q.previousID != -1) {
        let cID = q.previousID;
        let c = examJson.questions[cID + ''];
        c.nextID = bID;
        b.previousID = cID;
    } else {
        b.previousID = -1;
    }
    if (b.nextID != -1) {
        let dID = b.nextID;
        let d = examJson.questions[dID + ''];
        d.previousID = parseInt(qID);
        q.nextID = dID;
    } else {
        q.nextID = -1;
    }
    q.previousID = bID;
    b.nextID = parseInt(qID);

    let domA = document.getElementById(qID + '_question');
    let domB = document.getElementById(bID + '_question');
    domB.parentNode.insertBefore(domB, domA);
    if (examJson.latestQuestionId == bID)
        examJson.latestQuestionId = parseInt(qID);
}

/**
 * move a question upwards
 * @param event event to be cancelled
 * @param qID questionid
 */
function exam_moveQuestion_up(event, qID) {
    //before moving a (order top to bottom): d b a c
    //after  moving a (order top to bottom): d a b c
    let a = examJson.questions[qID+''];
    if (a.previousID != -1){
        exam_moveQuestion_up_dom(qID, a);
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
        apiCall('PATCH', questionPos, 'exam/' + exam_referenceID + '/setquestionsposition', false, (success, data) => {
            if (!success) {
                M.toast({html: 'Could not move that question!'});
                exam_moveQuestion_down_dom(qID, a);
            }
        });
    }
    event.preventDefault();
    event.stopPropagation();
}

/**
 * move DOM content of q question upwards
 * @param qID question id
 * @param q examJson reference to the the question
 */
function exam_moveQuestion_up_dom(qID, q) {
    let bID = q.previousID;
    let b = examJson.questions[bID+''];

    if (q.nextID != -1){
        let cID = q.nextID;
        let c = examJson.questions[cID+''];
        c.previousID = bID;
        b.nextID = cID;
    }else{
        b.nextID = -1;
    }
    if (b.previousID != -1){
        let dID = b.previousID;
        let d = examJson.questions[dID+''];
        d.nextID = parseInt(qID);
        q.previousID = dID;
    }else{
        q.previousID = -1;
    }
    q.nextID = bID;
    b.previousID = parseInt(qID);

    let domA = document.getElementById(qID + '_question');
    let domB = document.getElementById(bID + '_question');
    domA.parentNode.insertBefore(domA, domB);
    if (examJson.latestQuestionId == qID)
        examJson.latestQuestionId = bID;
}
