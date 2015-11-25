// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main');
var sharedfunctions = require('../model/sharedfunctions');

// Define the get function that will return the content..?
function get(request, response) {
        
    // Define the different parts of the page.
    var headline = 'Home';
    var body = ['<div class="panel panel-default">',
                     '<div class="panel-heading">',
                        '<h5 class="panel-title">Schedule Control</h5>',
                    '</div>',
                    '<div class="panel-body">',
                        '<p class="text-info {schedulepauseclass}" id="pauseparagraph">Schedule status: <span id="schedulestatus">{schedulestatus}</span></p>',
                        '<button class="btn btn-default" onClick="pause_schedules()" id="pausebutton">{pausebutton} schedules</button> ',
                        '<button class="btn btn-default" onClick="reset_schedules()">Reset devices state</button>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                     '<div class="panel-heading">',
                        '<h5 class="panel-title">Available Devices</h5>',
                    '</div>',
                    '<div class="panel-body">',
                    '<table class="table table-bordered">',
                    '<tr><th>Status</th><th>Next Schedule</th><th>Device</th></tr>',
                    '{available-devices}',
                    '</table>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                     '<div class="panel-heading">',
                        '<h5 class="panel-title">Available Devicegroups</h5>',
                    '</div>',
                    '<div class="panel-body">',
                    '<table class="table table-bordered">',
                    '<tr><th>Status</th><th>Devicegroup</th></tr>',
                    '{available-devicegroups}',
                    '</table>',
                    '</div>',
                '</div>'
                ];
    
    // Join each row of the body array to a continious string with proper row endings.
    body = body.join("\n");
    
    var available_devices = ''; 
    var available_devicegroups = '';

    variables.devices.forEach(function(device, index) {
        var status_on = '';
        var status_off = '';
        var status_dim = '';
        var dimbutton = '';
        var schedule = {time: '', action: ''};
        
        
        device.schedule.forEach(function (singleschedule) {
            if (singleschedule.uniqueid == device.nextschedule) {
                schedule = singleschedule;
            }
        });
        

        if (device.lastcommand.toLowerCase() == 'on') {
            status_on = 'btn-success';
        }
        if (device.lastcommand.toLowerCase() == 'off') {
            status_off = 'btn-success';
        }
        if (device.lastcommand.toLowerCase() == 'dim') {
            status_dim = 'btn-success';
        }

        if (variables.options.showdimoption == 'true') {
            dimbutton = '<button disabled class="btn btn-default '+status_dim+'" id="commandbutton_' + device.id + '_dim" onClick="switchdevicestatus(\'' + device.id + '\',\'dim\');">DIM</button>';
        }
        if (device.type == 'group') {
            avalable_devicegroups += '<tr><td class="devicestatus"><button class="btn btn-default '+status_on+'" id="commandbutton_' + device.id + '_on" onClick="switchdevicestatus(\'' + device.id + '\',\'on\');">ON</button><button class="btn btn-default '+status_off+'" id="commandbutton_' + device.id + '_off" onClick="switchdevicestatus(\'' + device.id + '\',\'off\');">OFF</button>'+dimbutton+'</td><td class="devicestatus">'+schedule.time+' '+ schedule.action +'</td><td>'+device.name+'</td></tr>';
        } else {
            available_devices += '<tr><td class="devicestatus"><button class="btn btn-default '+status_on+'" id="commandbutton_' + device.id + '_on" onClick="switchdevicestatus(\'' + device.id + '\',\'on\');">ON</button><button class="btn btn-default '+status_off+'" id="commandbutton_' + device.id + '_off" onClick="switchdevicestatus(\'' + device.id + '\',\'off\');">OFF</button>'+dimbutton+'</td><td class="devicestatus">'+schedule.time+' '+ schedule.action +'</td><td>'+device.name+'</td></tr>';
        }

    });

    body = body.replace(/{available-devices}/g,available_devices);
    body = body.replace(/{available-devicegroups}/g,available_devicegroups);

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

exports.get = get;