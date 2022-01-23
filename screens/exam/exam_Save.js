function saveExam_checkChanges() {
    for (let key of Object.keys(examChanges)){
        if (Object.keys(examChanges[key]).length != 0){
            document.getElementById('exam_floatingbtn').style.display = 'block';
            return;
        }
    }
    document.getElementById('exam_floatingbtn').style.display = 'none';
}

function saveExam() {

}
