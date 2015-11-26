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
    var headline = 'View All Schedules';
    var body = ['<div class="panel panel-default">',
                     '<div class="panel-heading">',
                        '<h5 class="panel-title">Filter view</h5>',
                    '</div>',
                    '<div class="panel-body">',
                        '<table class="table table-bordered">',
                            '<tr><td class="td-middle">By device:</td><td><select id="devicetoview">{devicetoview}</select></td></tr>',
                            '<tr><td class="td-middle">Schedules with status:</td><td><select id="schedulestoview">{schedulestoview}</select></td></tr>',
                            '<tr><td><button class="btn btn-default" onclick="filter();">Filter</button></td></tr>',   
                        '</table>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        '<h5 class="panel-title">Timers</h5>',
                    '</div>',
                    '<div class="panel-body">',
                    '<div class="table-responsive">',
                    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered">',
                    '{Timers}',
                    '</table>',
                    '</div>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        '<h5 class="panel-title">Schedules</h5>',
                    '</div>',
                    '<div class="panel-body">',
                    '<div class="table-responsive">',
                    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered">',
                    '{scheduled-devices}',
                    '</table>',
                    '</div>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        '<h5 class="panel-title">Schedules by day</h5>',
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
        var schedules = '<tr><th>Device</th><th>Action</th><th>Controller</th><th>Day of Week</th><th>Time</th><th></th></tr>';
        var timers = '<tr><th>Device</th><th>Duration</th><th>Day of Week</th><th>Time</th><th></th></tr>';
        var dayofweektranslate = {0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'};
        var devicetoview = '';
        var selected_deviceid = 0;
        var selected_scheduletype = '';
        var schedulesfound = false;
        var timersfound = false;
        var watchersfound = false;
        
        
        if(typeof(request.query.deviceid) != 'undefined') {
            selected_deviceid = request.query.deviceid;
        }
        
        if(typeof(request.query.scheduletype) != 'undefined') {
            selected_scheduletype = request.query.scheduletype;
        }
        
        
        variables.devices.forEach(function(device, index) {
            
            if (device.id == selected_deviceid) {
                devicetoview = devicetoview + '<option selected value="'+device.id + '">'+device.name;
            } else {
                devicetoview = devicetoview + '<option value="'+device.id + '">'+device.name;
            }
            
            device_options += '<option value="' + device.id + '">'+device.name + '\n';
               
            
            if(device.schedule.length > 0) {
                device.schedule.sort(sharedfunctions.dynamicSortMultiple('dayofweek','time'));
                device.schedule.forEach (function(singleschedule) {
                    var dayname = '';
                    var activeschedule = '';
                    
                    singleschedule.dayofweek.forEach(function(day) {
                        dayname += dayofweektranslate[day] + ', ';
                    });
                    dayname = dayname.substring(0,(dayname.length-2));
                    

                    
                    if (device.activescheduleid == singleschedule.uniqueid) {
                                activeschedule = 'class="bg-success"';
                    }
                    
                    
                    if ( (device.id == selected_deviceid) || (selected_deviceid == 0) ) {
                        if ( (selected_scheduletype == '') || (selected_scheduletype == singleschedule.enabled) ) {
                            if (singleschedule.controller != 'Timer') {
                                schedulesfound = true;
                                schedules += '<tr onclick="showscheduleinfo(\''+singleschedule.uniqueid+'\')"><td ' + activeschedule +'>' + device.name + '</td><td ' + activeschedule +'>'+  singleschedule.action +  '</td><td ' + activeschedule +'>'+ singleschedule.controller +'</td><td ' + activeschedule +'>'  + dayname + '</td><td ' + activeschedule +'>' + singleschedule.time + '</td><td ' + activeschedule +'><a class="btn btn-default" href="/editschedule?uniqueid='+singleschedule.uniqueid+'">Edit</a><button class="btn btn-default" onclick="removeschedule(\''+singleschedule.uniqueid+'\')">Remove</button></td></tr>';
                            } else {
                                timersfound = true;
                                timers += '<tr onclick="showscheduleinfo(\''+singleschedule.uniqueid+'\')"><td ' + activeschedule +'>' + device.name + '</td><td ' + activeschedule +'>'+  singleschedule.duration +  ' minutes</td><td ' + activeschedule +'>'  + dayname + '</td><td ' + activeschedule +'>' + singleschedule.time + '</td><td ' + activeschedule +'><a class="btn btn-default" href="/editschedule?uniqueid='+singleschedule.uniqueid+'">Edit</a><button class="btn btn-default" onclick="removeschedule(\''+singleschedule.uniqueid+'\')">Remove</button></td></tr>';
                            }
                        }
                    }
                });
            };
            
        });
        // Testing new shcedulethingy
        var sortedbyday = schedulefunctions.getschedulesbyday();
        var schedulesbyday = '';
        var schedulesbydayfound = false;
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
                        if ( (singleschedule.deviceid == selected_deviceid) || (selected_deviceid == 0) ) {
                            if (singleschedule.controller != 'Timer') {
                                schedulesbydayfound = true;
                                schedulesbyday += '<tr><td ' + activeschedule +'>' + devicename + '</td><td ' + activeschedule +'>'+  singleschedule.action +  '</td><td ' + activeschedule +'>'+ singleschedule.controller +'</td><td ' + activeschedule +'>' + singleschedule.time + '</td></tr>';
                            }
                        }
                    });
                } 
            }
        }
        
        if(schedulesfound == false) {
            schedules = '<tr><td><p class="text-info">No schedules found.</p></td></tr>';
        }
        if(timersfound == false) {
            timers = '<tr><td><p class="text-info">No timers found.</p></td></tr>';
        }
        
        if (watchersfound == false) {
            watchers = '<tr><td><p class="text-info">No watchers found.</p></td></tr>';  
        }
        if(schedulesbydayfound == false) {
            schedulesbyday = '<tr><td><p class="text-info">No schedules found.</p></td></tr>';
        }
        
        devicetoview = '<option value="0">All' + devicetoview;
        // End of testing
        body = body.replace(/{scheduled-devices-by-day}/g,schedulesbyday);
        body = body.replace(/{scheduled-devices}/g,schedules);
        body = body.replace(/{select_device}/g,device_options);
        body = body.replace(/{Timers}/g,timers);
        body = body.replace(/{devicetoview}/g,devicetoview);
        body = body.replace(/{schedulestoview}/g,sharedfunctions.createdropdown_alphanumeric([['','Any'],['true','Enabled'],['false','Disabled']],selected_scheduletype));
        var schedulestatus = 'Running normal';
        var schedulepauseclass = '';
        var pausebutton = 'Pause';
        if(variables.pauseschedules) {
            schedulestatus = 'Paused';
            schedulepauseclass = 'bg-danger';
            pausebutton = 'Resume';
        }
        body = body.replace(/{schedulestatus}/g,schedulestatus);
        body = body.replace(/{schedulepauseclass}/g,schedulepauseclass);
        body = body.replace(/{pausebutton}/g,pausebutton);
    
        response.send(template.build(headline,body,true));
    }
    
   
}

exports.get = get;