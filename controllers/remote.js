// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main');
var saltedpasswords = require('./saltedpasswords.js').saltedpasswords;

// Define the get function that will return the content..?
function get(request, response) {
    
    // Define the different parts of the page.
    var headline = 'Remote';
    var body = ['<table class="table table-bordered">',
                    '<tr><th>Status</th><th>Device</th></tr>',
                    '{available-devices}',
                    '</table>'              
                ];
    //'<div class="panel panel-default">','</div>'
    // Join each row of the body array to a continious string with proper row endings.
    body = body.join("\n");
    display_devices();
    

    
    // Define the function that enters devices into the device select box.
    // This function will be supplied to be used as a callback for when tdtool listing is done and fetching from 'database' is done.
    function display_devices () {
        var available_devices = '';
        var dayofweektranslate = {0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'};
        
        variables.devices.forEach(function(device, index) {
            var status_on = '';
            var status_off = '';
            var status_dim = '';
            if (device.lastcommand.toLowerCase() == 'on') {
                status_on = 'btn-success';
            }
            if (device.lastcommand.toLowerCase() == 'off') {
                status_off = 'btn-success';
            }
            if (device.lastcommand.toLowerCase() == 'dim') {
                status_dim = 'btn-success';
            }
            available_devices += '<tr><td class="devicestatus"><button class="btn btn-default '+status_on+'" id="commandbutton_' + device.id + '_on" onClick="switchdevicestatus(\'' + device.id + '\',\'off\');">ON</button><button class="btn btn-default '+status_off+'" id="commandbutton_' + device.id + '_off" onClick="switchdevicestatus(\'' + device.id + '\',\'on\');">OFF</button><button disabled class="btn btn-default '+status_dim+'" id="commandbutton_' + device.id + '_dim" onClick="switchdevicestatus(\'' + device.id + '\',\'dim\');">DIM</button></td><td>'+device.name+'</td></tr>';
        });
        
        // End of testing
        body = body.replace(/{available-devices}/g,available_devices);
        
        var loggedin = false;
        currentSession = request.session;
        if ( (currentSession.hash) && (currentSession.username) ) {
            if (saltedpasswords(currentSession.username + 'tellstick',8,currentSession.hash)) {
                loggedin = true;
            }
        }
            
            
        response.send(template.build(headline,body,loggedin));
    }
    
   
}

exports.get = get;