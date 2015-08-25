// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main');
var schedulefunctions = require('./schedulefunctions');
var sharedfunctions = require('../model/sharedfunctions');

// Define the get function that will return the content..?
function get(request, response) {
    
    // Define the different parts of the page.
    var headline = 'View All Watchers';
    var body = ['<div class="panel panel-default">',
                     '<div class="panel-heading">',
                        '<h5 class="panel-title">Filter view</h5>',
                    '</div>',
                    '<div class="panel-body">',
                        '<table class="table table-bordered">',
                            '<tr><td class="td-middle">By device:</td><td><select id="devicetoview">{devicetoview}</select></td></tr>',
                            '<tr><td class="td-middle">Watchers with status:</td><td><select id="schedulestoview">{schedulestoview}</select></td></tr>',
                            '<tr><td><button class="btn btn-default" onclick="filter();">Filter</button></td></tr>',   
                        '</table>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        '<h5 class="panel-title">Watchers</h5>',
                    '</div>',
                    '<div class="panel-body">',
                    '<div class="table-responsive">',
                    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered">',
                    '{Watchers}',
                    '</table>',
                    '</div>',
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
        var watchers = '<tr><th>Device</th><th>Trigger State</th><th>Wait (Minutes)</th><th>Set State</th><th></th></tr>';
        var devicetoview = '';
        var selected_deviceid = 0;
        var selected_scheduletype = '';
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
            
            if (device.watchers.length > 0) {
                device.watchers.forEach (function(watcher) {
                    if ( (device.id == selected_deviceid) || (selected_deviceid == 0) ) {
                            if ( (selected_scheduletype == '') || (selected_scheduletype == singleschedule.enabled) ) {
                                watchersfound = true;
                                watchers += '<tr onclick="showwatcherinfo(\''+watcher.uniqueid+'\')"><td>' + device.name + '</td><td>'+  watcher.triggerstatus +  '</td><td>'  + watcher.delay + '</td><td>' + watcher.setstatus + '</td><td><a class="btn btn-default" href="/editwatcher?uniqueid='+watcher.uniqueid+'">Edit</a><button class="btn btn-default" onclick="removewatcher(\''+watcher.uniqueid+'\')">Remove</button></tr>';
                            }
                    }
                });
            }
        });

        if (watchersfound == false) {
            watchers = '<tr><td><p class="text-info">No watchers found.</p></td></tr>';  
        }
 
        devicetoview = '<option value="0">All' + devicetoview;
        // End of testing
        body = body.replace(/{select_device}/g,device_options);
        body = body.replace(/{Watchers}/g,watchers);
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