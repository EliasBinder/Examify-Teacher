//{import overlay/template/navigation.js}

if (typeof holdingslist === 'undefined')
    var holdingslist;
holdingslist = {}; //Store globally in case of adding a search field later

domLoadListenerAdd(() => {
    M.Collapsible.init(document.querySelectorAll('.collapsible'));
});

function retrieveExamlist() {
    apiCall('GET', null, 'holdinglist', false, (success, json) => {
        if (success){
            holdingslist = json;
            console.log("Holdinglist", json);
            renderExams(holdingslist);
        }else{
            M.toast({html: 'Could not retrieve your exams! Please try again later!'});
        }
    });
}
retrieveExamlist();

function renderExams(holdingslist) {
    let examCollapsibleEntryHTML = document.getElementById('exam_collapsible_entry_template').innerHTML.trim();
    let examCollapsibleHTML = document.getElementById('exam_collapsible_template').innerHTML.trim();
    for (let examID of Object.keys(holdingslist)){
        let examname = holdingslist[examID].name;

        let entries = "";
        for (let entry of holdingslist[examID].holdings){
            let startDate = new Date(entry.start);
            let entryHTML = examCollapsibleEntryHTML
                .replace('%startdate%', startDate.getDate() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getFullYear())
                .replace('%starttime%', formatAMPM(startDate))
                .replaceAll('%ref%', entry.ref);

            entries += entryHTML;
        }

        let examHTML = examCollapsibleHTML
            .replace('%examname%', examname)
            .replace('<tbody>', '<tbody>' + entries);

        let examColTemplate = document.createElement('template');
        examColTemplate.innerHTML = examHTML;
        document.getElementById('exam_collapsible').appendChild(examColTemplate.content.firstChild);
    }
}

/**
 * Source: https://stackoverflow.com/a/8888498
 * @param date
 * @returns {string}
 */
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}
