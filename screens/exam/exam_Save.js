setWindowEvent('close', 'saveExam_beforeClose');

function saveExam_beforeClose(){
    return new Promise(resolve => {
        if (saveExam_checkChanges_internal()) {
            window.intercom.receive('dialog', json => {
                if (json.responseInt == 0) {
                    saveExamSync().then(status => {
                        resolve(status);
                    });
                }else{
                    resolve(true);
                }
            });
            window.intercom.send('dialog', {
                type: 'messageBox',
                options: {
                    type: 'info',
                    buttons: ['Ok', 'Exit'],
                    cancelId: 1,
                    defaultId: 0,
                    title: 'Warning',
                    detail: 'Some changes are not yet saved. Would you like to save them now?'
                }
            });
        }else {
            resolve(true);
        }
    });
}

function saveExam_checkChanges() {
    if (saveExam_checkChanges_internal())
        document.getElementById('exam_floatingbtn').style.display = 'block';
    else
        document.getElementById('exam_floatingbtn').style.display = 'none';
}

function saveExam_checkChanges_internal(){
    for (let key of Object.keys(examChanges)){
        if (Object.keys(examChanges[key]).length != 0){
            return true;
        }
    }
    return false;
}

function saveExamSync() {
    return new Promise(resolve => {
        let content = {};
        for (let key of Object.keys(examChanges)){
            content[key] = {};
            if (examChanges[key].hasOwnProperty('title'))
                content[key].title = examChanges[key].title.new;
            if (examChanges[key].hasOwnProperty('content'))
                content[key].content = examChanges[key].content.new;
        }
        apiCallSync('PATCH', content, 'exam/' + exam_refID + '/updatetext').then(json => {
            examChanges = {};
            document.getElementById('exam_floatingbtn').style.display = 'none';
            resolve(true);
        }).catch(() => {
            M.toast({html: 'Could not save changes!'});
            resolve(false);
        });
    });
}

function saveExamAsync() {
    let content = {};
    for (let key of Object.keys(examChanges)){
        content[key] = {};
        if (examChanges[key].hasOwnProperty('title'))
            content[key].title = examChanges[key].title.new;
        if (examChanges[key].hasOwnProperty('content'))
            content[key].content = examChanges[key].content.new;
    }
    apiCall('PATCH', content, 'exam/' + exam_refID + '/updatetext', false, (success, json) => {
        if (success){
            examChanges = {};
            document.getElementById('exam_floatingbtn').style.display = 'none';
        }else{
            M.toast({html: 'Could not save changes!'});
        }
    })
}
