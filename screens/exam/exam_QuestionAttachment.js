async function exam_addQAttachment(qid, type) {
    let dialogResult;
    if (type == 0) { //image
        dialogResult = await openDialogSync('open', {
            'title': 'Add an image',
            'filters': [
                {name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'apng', 'avif', 'svg', 'webp']}
            ],
            'properties': [
                'openFile', 'multiSelections'
            ]
        });
        if (dialogResult.length != 0){
            document.getElementById(qid + '_question_attachments_row').style.removeProperty('display');
            for (let x of dialogResult){
                examJson.questions[qid+''].attachments[examJson.questions[qid+''].attachmentsCounter+''] = {
                    'type': type,
                    'path': x.path,
                    'name': x.name
                };
                let questionAttachmentHTML = document.getElementById('exam_questionAttachmentTemplate').innerHTML;
                questionAttachmentHTML = questionAttachmentHTML.replace('%type%', 'image')
                    .replace('%name%', x.name)
                    .replaceAll('%qid%', qid)
                    .replaceAll('%id%', examJson.questions[qid+''].attachmentsCounter)
                    .trim();
                let questionAttachmentTemplate = document.createElement('template');
                questionAttachmentTemplate.innerHTML = questionAttachmentHTML;
                document.getElementById(qid + '_question_attachments').appendChild(questionAttachmentTemplate.content.firstChild);
                examJson.questions[qid+''].attachmentsCounter ++;
            }
        }
    }else if (type == 3){ //file
        dialogResult = await openDialogSync('open', {
            'title': 'Add an image',
            'filters': [
                {name: 'All Files', extensions: ['*']}
            ],
            'properties': [
                'openFile', 'multiSelections'
            ]
        });
        if (dialogResult.length != 0){
            document.getElementById(qid + '_question_attachments_row').style.removeProperty('display');
            for (let x of dialogResult){
                examJson.questions[qid+''].attachments[examJson.questions[qid+''].attachmentsCounter+''] = {
                    'type': type,
                    'path': x.path,
                    'name': x.name
                };
                let questionAttachmentHTML = document.getElementById('exam_questionAttachmentTemplate').innerHTML;
                questionAttachmentHTML = questionAttachmentHTML.replace('%type%', 'insert_drive_file')
                    .replace('%name%', x.name)
                    .replaceAll('%qid%', qid)
                    .replaceAll('%id%', examJson.questions[qid+''].attachmentsCounter)
                    .trim();
                let questionAttachmentTemplate = document.createElement('template');
                questionAttachmentTemplate.innerHTML = questionAttachmentHTML;
                document.getElementById(qid + '_question_attachments').appendChild(questionAttachmentTemplate.content.firstChild);
                examJson.questions[qid+''].attachmentsCounter ++;
            }
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
    }
}
