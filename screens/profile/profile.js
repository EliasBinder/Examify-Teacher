//{import overlay/template/navigation.js}
domLoadListenerAdd(() => {
    M.Modal.init(document.querySelectorAll('.modal'));
});

function profile_updateData(){
    document.getElementById('profile_firstname').value = profileInfo['firstname'];
    document.getElementById('profile_lastname').value = profileInfo['lastname'];
    if (profileInfo['profileImg'] !== 'none')
        document.getElementById('profile_image').src = profileInfo['profileImg'];
}
profile_updateData();


function profile_resetImage() {
    apiCall('DELETE', null, 'profile/image', true, (success, json) => {
        if (success){
            profileInfo['profileImg'] = 'none';
            document.getElementById('navigation_profileImg').src = '../../resources/images/profile_default.svg';
            document.getElementById('profile_image').src = '../../resources/images/profile_default.svg';
        }
    });
}

async function profile_setImage() {
    let dialogResult = await openDialogSync('open', {
        'title': 'Add an image',
        'filters': [
            {
                name: 'Images',
                extensions: ['jpg', 'jpeg', 'png', 'gif', 'apng', 'avif', 'svg', 'webp']
            }
        ]
    });
    if (dialogResult.length != 0){
        let file = dialogResult[0];
        console.log(dialogResult);
        let reader = new FileReader();
        reader.onloadend = function() {
            M.toast({html: 'Uploading new profile image...'});
            apiCall('POST', {
                'image': reader.result
            }, 'profile/image', true, (success, json) => {
                if (success){
                    profileInfo['profileImg'] = reader.result;
                    document.getElementById('navigation_profileImg').src = reader.result;
                    document.getElementById('profile_image').src = reader.result;
                    M.toast({html: 'New profile image uploaded!'});
                }
            });
        }
        let blobImage = await fetch(file.path).then(r => r.blob());
        reader.readAsDataURL(blobImage);
    }
}

function profile_saveChanges() {
    let fn = document.getElementById('profile_firstname').value;
    let ln = document.getElementById('profile_lastname').value;
    apiCall('POST', {
        'firstname': fn,
        'lastname': ln
    }, 'profile/data', true, (success, json) => {
        if (success){
            profileInfo['firstname'] = json['firstname'];
            profileInfo['lastname'] = json['lastname'];
            document.getElementById('navigation_name').innerText = json['firstname'] + ' ' + json['lastname'];
            M.toast({html: 'Saved changes!'});
        }else{
            M.toast({html: 'Could not save changes!'});
        }
    });
}

function profile_changePassword() {
    let modalInstance = M.Modal.getInstance(document.getElementById('profile_modal_changePassword'));
    modalInstance.open();
}

function profile_changePassword_close() {
    document.getElementById('profile_modal_changePassword_curPass').value = '';
    document.getElementById('profile_modal_changePassword_newPass1').value = '';
    document.getElementById('profile_modal_changePassword_newPass2').value = '';
    let modalInstance = M.Modal.getInstance(document.getElementById('profile_modal_changePassword'));
    modalInstance.close();
}

function profile_changePassword_submit() {
    if (document.getElementById('profile_modal_changePassword_newPass1').value !== document.getElementById('profile_modal_changePassword_newPass2').value){
        M.toast({html: 'The new password and the repeated new password do not match!'});
        return false;
    }

    if (document.getElementById('profile_modal_changePassword_newPass1').value.length < 8){
        M.toast({html: 'The new password has to have at least 8 characters!'});
        return false;
    }

    apiCall('POST', {
        'currentPassword': document.getElementById('profile_modal_changePassword_curPass').value,
        'newPassword': document.getElementById('profile_modal_changePassword_newPass1').value
    }, 'profile/password', true, (success, json) => {
        if (success){
            M.toast({html: 'Password changed!'});
        }else{
            M.toast({html: 'Could not change password!'});
        }
    });

    profile_changePassword_close();
}
