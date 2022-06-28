if (typeof AttachmentsMap === 'undefined'){
    var AttachmentsMap;
}
AttachmentsMap = [
    {
        filters: [
            {name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'apng', 'avif', 'svg', 'webp']}
        ],
        typeImage: 'image'
    }, {
        filters: [
            {name: 'Video', extensions: ['webm', 'mp4']}
        ],
        typeImage: 'movie'
    }, {
        filters: [
            {name: 'Audio', extensions: ['wav', 'mp3', 'vorbis', 'aac']}
        ],
        typeImage: 'headphones'
    }, {
        filters: [
            {name: 'All Files', extensions: ['*']}
        ],
        typeImage: 'insert_drive_file'
    }
];

/**
 * add question attachment to question
 * @param qid question id
 * @param type type of attachment to be added (image, video, ...)
 */
async function exam_addQAttachment(qid, type) {
    let filters = AttachmentsMap[type].filters;
    let typeImage = AttachmentsMap[type].typeImage;
    let dialogResult = await showDialogSync('open', {
        'title': 'Add an attachment',
        'filters': filters,
        'properties': [
            'openFile', 'multiSelections'
        ]
    });
    if (Object.keys(dialogResult).length != 0){
        document.getElementById(qid + '_question_attachments_row').style.removeProperty('display');
        for (let x of dialogResult){
            let id = uuidv4();
            while (examJson.questions[qid].attachments.hasOwnProperty(id)){
                id = uuidv4();
            }
            examJson.questions[qid+''].attachments[id] = {
                'type': type,
                'path': x.path,
                'name': x.name,
                'id': id
            };
            let questionAttachmentHTML = document.getElementById('exam_questionAttachmentTemplate').innerHTML;
            questionAttachmentHTML = questionAttachmentHTML.replace('%type%', typeImage)
                .replace('%name%', x.name)
                .replaceAll('%qid%', qid)
                .replaceAll('%id%', id)
                .trim();
            let questionAttachmentTemplate = document.createElement('template');
            questionAttachmentTemplate.innerHTML = questionAttachmentHTML;
            document.getElementById(qid + '_question_attachments').appendChild(questionAttachmentTemplate.content.firstChild);
            exam_uploadQAttachment(qid, id);
        }
    }
}

/**
 * add DOM contents for a question attachment in examJson
 * @param qid question id
 * @param id question attachment id
 */
function exam_importQAttachment(qid, id) {
    document.getElementById(qid + '_question_attachments_row').style.removeProperty('display');
    let attachment = examJson.questions[qid].attachments[id];
    let questionAttachmentHTML = document.getElementById('exam_questionAttachmentTemplate').innerHTML;
    questionAttachmentHTML = questionAttachmentHTML.replace('%type%', AttachmentsMap[attachment.type].typeImage)
        .replace('%name%', attachment.name)
        .replaceAll('%qid%', qid)
        .replaceAll('%id%', id)
        .trim();
    let questionAttachmentTemplate = document.createElement('template');
    questionAttachmentTemplate.innerHTML = questionAttachmentHTML;
    document.getElementById(qid + '_question_attachments').appendChild(questionAttachmentTemplate.content.firstChild);
}

/**
 * open modal to preview the question attachment
 * @param qid question id
 * @param id question attachment id
 */
function exam_previewQAttachment(qid, id){
    let attachment = examJson.questions[qid+''].attachments[id];
    if (attachment.type == 0) { //image
        let previewInstance = M.Modal.getInstance(document.getElementById('exam_modal_preview_img'));
        document.getElementById('exam_modal_preview_img_name').innerText = attachment.name;
        document.getElementById('exam_modal_preview_img_img').src = attachment.path;
        previewInstance.open();
    }else if (attachment.type == 1) { //video
        let previewInstance = M.Modal.getInstance(document.getElementById('exam_modal_preview_video'));
        document.getElementById('exam_modal_preview_video_name').innerText = attachment.name;
        document.getElementById('exam_modal_preview_video_video').src = attachment.path;
        previewInstance.open();
    }else if (attachment.type == 2) { //audio
        let previewInstance = M.Modal.getInstance(document.getElementById('exam_modal_preview_audio'));
        document.getElementById('exam_modal_preview_audio_name').innerText = attachment.name;
        document.getElementById('exam_modal_preview_audio_audio').src = attachment.path;
        previewInstance.open();
    }
}

/**
 * delete a question attachment
 * @param qid question id
 * @param id question attachment id
 * @param event events to be cancelled
 */
function exam_deleteQAttachment(qid, id, event) {
    apiCall('DELETE', null, 'exam/' + exam_referenceID + '/questions/' + qid + '/deleteattachment/' + id, false, (success, data) => {
        if (success){
            delete examJson.questions[qid+''].attachments[id];
            let dom = document.querySelectorAll('[attachmentId="' + id + '"]')[0];
            dom.parentNode.removeChild(dom);
            if (Object.keys(examJson.questions[qid+''].attachments).length == 0){
                document.getElementById(qid + '_question_attachments_row').style.display = 'none'
            }
            event.preventDefault();
            event.stopPropagation();
        }else{
            M.toast({html: 'Could not delete the attachment!'});
        }
    });
    event.preventDefault();
    event.stopPropagation();
}

/**
 * upload a question attachment to the server
 * @param qid question id
 * @param id question attachment id
 * @returns {Promise<void>} upload progress
 */
async function exam_uploadQAttachment(qid, id) {
    let attachment = examJson.questions[qid + ''].attachments[id];
    let toastInstance = M.toast({
        html: '<div>' +
            '<div>Uploading attachment</div><br/>' +
            '<div class="progress blue lighten-3">' +
            '    <div class="determinate blue" id="toast_upload_attachment_' + id + '" style="width: 0%"></div>' +
            '</div>' +
            '<div class="right" id="toast_upload_attachment_' + id + '_percent">' +
            '0%' +
            '</div>' +
            '</div>',
        displayLength: 'stay',
        userDismissible: false
    });
    let blob = await fetch(attachment.path).then(r => r.blob());
    let formData = new FormData();
    formData.append('file', blob, attachment.name);
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            toastInstance.dismiss();
            let respJSON = JSON.parse(this.response);
            if (respJSON['success'] === true){
                M.toast({html: 'Successfully uploaded the attachment!'});
            }else{
                M.toast({html: 'Could not upload the attachment!'});
                let domentry = document.querySelectorAll('[attachmentid="' + id + '"]')[0];
                document.getElementById(qid + '_question_attachments').removeChild(domentry);
                delete examJson.questions[qid+''].attachments[id];
                if (Object.keys(examJson.questions[qid+''].attachments).length == 0)
                    document.getElementById(qid + '_question_attachments_row').style.display = 'none';
            }
        }else if (this.readyState == 4 && this.status != 200 || this.readyState == 0){
            toastInstance.dismiss();
            M.toast({html: 'Could not upload the attachment!'});
            let domentry = document.querySelectorAll('[attachmentid="' + id + '"]')[0];
            document.getElementById(qid + '_question_attachments').removeChild(domentry);
            delete examJson.questions[qid+''].attachments[id];
            if (Object.keys(examJson.questions[qid+''].attachments).length == 0)
                document.getElementById(qid + '_question_attachments_row').style.display = 'none';
        }
    };
    xhr.upload.onprogress = function (e) {
        let percentUpload = Math.floor(100 * e.loaded / e.total) + '%';
        document.getElementById('toast_upload_attachment_' + id).style.width = percentUpload;
        document.getElementById('toast_upload_attachment_' + id + '_percent').innerText = percentUpload;
    }
    xhr.open('PUT', connection.url + 'exam/' + exam_referenceID + '/questions/' + qid + '/addattachment', true);
    xhr.send(formData);
}
