//{import overlay/template/navigation.js}

domLoadListenerAdd(() => {
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
});

function retrieveExamlist() {
    apiCall('GET', null, 'examlist', false, (success, json) => {
        if (success){
            examlist = json;
            renderExams(examlist);
        }else{
            M.toast({html: 'Could not retrieve your exams! Please try again later!'});
        }
    });
}
retrieveExamlist();

function renderExams(examlist) {
    for (let examID of Object.keys(examlist)){
        let examname = examlist[examID].name;
        let examCollapsibleHTML = document.getElementById('exam_collapsible_template').innerHTML;
        examCollapsibleHTML = examCollapsibleHTML.replaceAll('%examname%', examname).trim();
        let examColTemplate = document.createElement('template');
        examColTemplate.innerHTML = examCollapsibleHTML;
        document.getElementById('exam_collapsible').appendChild(examColTemplate.content.firstChild);
    }
}
