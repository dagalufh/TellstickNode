// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main');
var schedulefunctions = require('./schedulefunctions');
var sharedfunctions = require('../model/sharedfunctions');

// Define the get function that will return the content..?
function get(request, response) {
    
    var currenttimestamp = new Date();
    var today = currenttimestamp.getUTCDay();
        
    // Define the different parts of the page.
    var headline = 'Home';
    var body = ['<p class="text-info"><button class="btn btn-default" onClick="pause_schedules()">Pause all schedules</button> Schedule status: <span id="schedulestatus">{schedulestatus}</span></p>',
                '<div class="panel panel-default">',
                     '<div class="panel-heading">',
                        '<h3>Available Devices</h3>',
                    '</div>',
                    '<div class="panel-body">',
                    '<table class="table table-bordered">',
                    '<tr><th>Last Command</th><th>Device Name</th></tr>',
                    '{available-devices}',
                    '</table>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        '<h3>Timers</h3>',
                    '</div>',
                    '<div class="panel-body">',
                    '<div class="table-responsive">',
                    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered">',
                    '<tr><th>Name</th><th>Action</th><th>Controller</th><th>Day of Week</th><th>Time</th><th></th></tr>',
                    '{Timers}',
                    '</table>',
                    '</div>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        '<h3>Schedules</h3>',
                    '</div>',
                    '<div class="panel-body">',
                    '<div class="table-responsive">',
                    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered">',
                    '<tr><th>Name</th><th>Action</th><th>Controller</th><th>Day of Week</th><th>Time</th><th></th></tr>',
                    '{scheduled-devices}',
                    '</table>',
                    '</div>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        '<h3>Schedules by day</h3>',
                    '</div>',
                    '<div class="panel-body">',
                    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered">',
                    '{scheduled-devices-by-day}',
                    '</table>',
                    '</div>',
                '</div>'
                ];
    
    // Join each row of the body array to a continious string with proper row endings.
    body = body.join("\n");
    display_devices();
    

    
    // Define the function that enters devices into the device select box.
    // This function will be supplied to be used as a callback for when tdtool listing is done and fetching from 'database' is done.
    function display_devices () {
        var device_options = '';
        var available_devices = '';
        var schedules = '';
        var timers = '';
        var dayofweektranslate = {0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'};
        
        variables.devices.forEach(function(device, index) {
            
            
            device_options += '<option value="' + device.id + '">'+device.name + '\n';
            available_devices += '<tr><td><button class="btn btn-default" id="commandbutton_' + device.id + '" onClick="switchdevicestatus(\'' + device.id + '\');">'+device.lastcommand+'</button></td><td>'+device.name+'</td></tr>';
            
            if(device.schedule.length > 0) {
                device.schedule.sort(sharedfunctions.dynamicSortMultiple('dayofweek','time'));
                device.schedule.forEach (function(singleschedule) {
                    var dayname = '';
                    var activeschedule = '';
                    
                    singleschedule.dayofweek.forEach(function(day) {
                        dayname += dayofweektranslate[day] + ', ';
                    });
                    
                    if (device.activescheduleid == singleschedule.uniqueid) {
                                activeschedule = 'class="bg-success"';
                                
                    }
                    if (singleschedule.controller != 'Timer') {
                        schedules += '<tr><td ' + activeschedule +'>' + device.name + '</td><td ' + activeschedule +'>'+  singleschedule.action +  '</td><td ' + activeschedule +'>'+ singleschedule.controller +'</td><td ' + activeschedule +'>'  + dayname + '</td><td ' + activeschedule +'>' + singleschedule.time + '</td><td ' + activeschedule +'><a class="btn btn-default" href="/editschedule?uniqueid='+singleschedule.uniqueid+'">Edit</a><button class="btn btn-default" onclick="removeschedule(\''+singleschedule.uniqueid+'\')">Remove</button></tr>';
                    } else {
                        timers += '<tr><td ' + activeschedule +'>' + device.name + '</td><td ' + activeschedule +'>'+  singleschedule.action +  '</td><td ' + activeschedule +'>'+ singleschedule.controller +'</td><td ' + activeschedule +'>'  + dayname + '</td><td ' + activeschedule +'>' + singleschedule.time + '</td><td ' + activeschedule +'><a class="btn btn-default" href="/editschedule?uniqueid='+singleschedule.uniqueid+'">Edit</a><button class="btn btn-default" onclick="removeschedule(\''+singleschedule.uniqueid+'\')">Remove</button></tr>';
                    }
                });
            };
        });
        // Testing new shcedulethingy
        var sortedbyday = schedulefunctions.getschedulesbyday();
        var schedulesbyday = '';
        for (var key in sortedbyday) {
            if (sortedbyday.hasOwnProperty(key)) {
                
                var day = sortedbyday[key];
                
               
                
                schedulesbyday += '<tr><th colspan="4">'+ dayofweektranslate[key] +'</th></tr><tr><th>Name</th><th>Action</th><th>Controller</th><th>Time</th></tr>';
                if(day.length > 0) {
                    day.sort(sharedfunctions.dynamicSortMultiple('time'));
                    
                    day.forEach (function(singleschedule) {
                        var devicename = '';
                        var activeschedule = '';
                         variables.devices.forEach(function(device) {
                            if (device.id == singleschedule.deviceid) {
                                devicename = device.name;
                            }
                            
                            if ( (device.activescheduleid == singleschedule.uniqueid) && (device.activeday == key) ) {
                                activeschedule = 'class="bg-success"';
                                
                            }
                        }); 
                        if (singleschedule.controller != 'Timer') {
                            schedulesbyday += '<tr><td ' + activeschedule +'>' + devicename + '</td><td ' + activeschedule +'>'+  singleschedule.action +  '</td><td ' + activeschedule +'>'+ singleschedule.controller +'</td><td ' + activeschedule +'>' + singleschedule.time + '</td></tr>';
                        }
                    });
                } 
            }
        }
        
        // End of testing
        body = body.replace(/{scheduled-devices-by-day}/g,schedulesbyday);
        body = body.replace(/{scheduled-devices}/g,schedules);
        body = body.replace(/{select_device}/g,device_options);
        body = body.replace(/{available-devices}/g,available_devices);
        body = body.replace(/{Timers}/g,timers);
        var schedulestatus = 'Running normal';
        if(variables.pauseschedules) {
            schedulestatus = 'Paused';
        }
        body = body.replace(/{schedulestatus}/g,schedulestatus);
    
        response.send(template.build(headline,body,true));
    }
    
   
}

exports.get = get;