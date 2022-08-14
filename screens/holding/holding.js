//{import overlay/template/navigation.js}

if (typeof holdingsParticipants === 'undefined')
    var holdingsParticipants;
holdingsParticipants = [];

function retreiveDetails() {
    apiCall('GET', null, 'holding/' + holding_referenceID + '/details', false, (success, json) => {
        if (success){
            document.getElementById('holding_ref').innerText = holding_referenceID;
            document.getElementById('holding_exam').innerText = json.exam;
            document.getElementById('holding_join').innerHTML = '<b>Joining Time:</b> ' + stringifyDate(new Date(json.joinDate));
            document.getElementById('holding_start').innerHTML = '<b>Start Time:</b> ' + stringifyDate(new Date(json.startDate));
        }else{
            M.toast({html: 'Could not retreive the holding! Please try again later!'});
        }
    });
}
retreiveDetails();

function retreiveParticipants() {
    let source = new EventSource(connection.url + "holding/" + holding_referenceID + "/participants");
    source.onmessage = function(event) {
        let json = JSON.parse(event.data);
        console.log("Server Sent event: " + json);
        if (json.action == 'join'){
            holdingsParticipants.push(json.participant);
            let participantHTML = document.getElementById('holding_participant_template').innerHTML.trim();
            let participantList = document.getElementById('holding_participant_list');
            let participantTemplate = document.createElement('template');
            participantTemplate.innerHTML = participantHTML
                .replace('%name%', json.participant.name)
                .replace('%id%', json.participant.id);
            participantList.appendChild(participantTemplate.content.firstChild);
            M.toast({html: json.participant.name + ' with id ' + json.participant.id + ' joined!'});
        }else if (json.action == 'leave'){
            let index = holdingsParticipants.findIndex(participant => participant.id == json.participant.id);
            if (index != -1){
                holdingsParticipants.splice(index, 1);
                M.toast({html: json.participant.name + ' with id ' + json.participant.id + ' left!'});
            }
        }
    };
}
retreiveParticipants();

//function to convert a date to string with format dd/mm/yy hh:mm am/pm
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

function stringifyDate(date){
    return date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear() + ' ' + formatAMPM(date);
}

function holding_toggleSearch() {
    let searchBtn = document.getElementById('holding_search_btn');
    let searchBar = document.getElementById('holding_search_bar');
    if (searchBtn.style.display == 'none'){
        searchBtn.style.removeProperty('display');
        searchBar.style.display = 'none';
        renderHoldingParticipants(holdingsParticipants);
    }else {
        searchBtn.style.display = 'none';
        searchBar.style.display = 'flex';
        document.getElementById('holding_search_bar_input').focus();
    }
}

function renderHoldingParticipants(participants) {
    let participantHTML = document.getElementById('holding_participant_template').innerHTML.trim();
    let participantList = document.getElementById('holding_participant_list');
    participantList.innerHTML = '';
    for (let participant of participants){
        let participantTemplate = document.createElement('template');
        participantTemplate.innerHTML = participantHTML
            .replace('%name%', participant.name)
            .replace('%id%', participant.id);
        participantList.appendChild(participantTemplate.content.firstChild);
    }
}
renderHoldingParticipants(holdingsParticipants);

function holding_search() {
    let input = document.getElementById('holding_search_bar_input').value;
    let result = [];
    for (let participant of holdingsParticipants){
        if (participant.name.toLowerCase().includes(input.toLowerCase()) || participant.id.toString().includes(input)){
            result.push(participant);
        }
    }
    renderHoldingParticipants(result);
}

