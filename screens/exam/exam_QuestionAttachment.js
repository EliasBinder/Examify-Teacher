async function exam_addQAttachment(qid, type) {
    let filters;
    let typeImage;

    if (type == 0) { //image
        filters = [
            {name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'apng', 'avif', 'svg', 'webp']}
        ];
        typeImage = 'image';
    }else if (type == 1) { //video
        filters = [
            {name: 'Video', extensions: ['webm', 'mp4']}
        ];
        typeImage = 'movie';
    }else if (type == 2) { //audio
        filters = [
            {name: 'Audio', extensions: ['wav', 'mp3', 'vorbis', 'aac']}
        ];
        typeImage = 'headphones';
    }else if (type == 3) { //file
        filters = [
            {name: 'All Files', extensions: ['*']}
        ];
        typeImage = 'insert_drive_file';
    }

    let dialogResult = await openDialogSync('open', {
        'title': 'Add an image',
        'filters': filters,
        'properties': [
            'openFile', 'multiSelections'
        ]
    });
    console.log('dialogResult: ');
    console.log(dialogResult)
    if (Object.keys(dialogResult).length != 0){
        document.getElementById(qid + '_question_attachments_row').style.removeProperty('display');
        for (let x of dialogResult){
            examJson.questions[qid+''].attachments[examJson.questions[qid+''].attachmentsCounter+''] = {
                'type': type,
                'path': x.path,
                'name': x.name
            };
            let questionAttachmentHTML = document.getElementById('exam_questionAttachmentTemplate').innerHTML;
            questionAttachmentHTML = questionAttachmentHTML.replace('%type%', typeImage)
                .replace('%name%', x.name)
                .replaceAll('%qid%', qid)
                .replaceAll('%id%', examJson.questions[qid+''].attachmentsCounter)
                .trim();
            let questionAttachmentTemplate = document.createElement('template');
            questionAttachmentTemplate.innerHTML = questionAttachmentHTML;
            document.getElementById(qid + '_question_attachments').appendChild(questionAttachmentTemplate.content.firstChild);
            exam_uploadQAttachment(qid, examJson.questions[qid+''].attachmentsCounter);
            examJson.questions[qid+''].attachmentsCounter ++;
        }
    }
}

function exam_previewQAttachment(qid, id){
    let attachment = examJson.questions[qid+''].attachments[id+''];
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

function exam_deleteQAttachment(qid, id, event) {
    delete examJson.questions[qid+''].attachments[id+''];
    let dom = document.querySelectorAll('[attachmentId="' + id + '"]')[0];
    dom.parentNode.removeChild(dom);
    if (Object.keys(examJson.questions[qid+''].attachments).length == 0){
        document.getElementById(qid + '_question_attachments_row').style.display = 'none'
    }
    event.preventDefault();
    event.stopPropagation();
}

function exam_uploadQAttachment(qid, id) {
    let toastInstance = M.toast({
        html: '<div>' +
            '<div>Uploading attachment</div><br/>' +
            '<div class="progress blue lighten-3">' +
            '    <div class="determinate blue" style="width: 70%"></div>' +
            '</div>' +
            '<div class="right">' +
            '70%' +
            '</div>' +
            '</div>',
        displayLength: 'stay',
        userDismissible: false
    });
}
