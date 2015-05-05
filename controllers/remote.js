// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main');
var saltedpasswords = require('./saltedpasswords.js').saltedpasswords;

// Define the get function that will return the content..?
function get(request, response) {
    
    // Define the different parts of the page.
    var headline = 'Remote';
    var body = ['<table class="table table-bordered">',
                    '<tr><th>Last Command</th><th>Device Name</th></tr>',
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
            available_devices += '<tr><td><button class="btn btn-default" id="commandbutton_' + device.id + '" onClick="switchdevicestatus(\'' + device.id + '\');">'+device.lastcommand+'</button></td><td>'+device.name+'</td></tr>';
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