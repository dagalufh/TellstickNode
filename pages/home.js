function get(request, response) {
  var variables = require('../templates/variables');
  // Include the template view (Do all the presentation(?))
  var template = require(variables.rootdir + 'templates/template-main');
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
  var schedulefunctions = require(variables.rootdir + 'functions/schedulefunctions');
  var classes = require(variables.rootdir + 'templates/classes');
  // Define the different parts of the page.
  var headline = 'Home';
  var body = ['<div class="panel panel-default">',
    '<div class="panel-heading">',
    '<h5 class="panel-title">Schedule Control</h5>',
    '</div>',
    '<div class="panel-body">',
    '<p class="text-info {schedulepauseclass}" id="pauseparagraph">Schedule status: <span id="schedulestatus">{schedulestatus}</span></p>',
    '<button class="btn btn-default btn-sm" onClick="pause_schedules()" id="pausebutton">{pausebutton} schedules</button> ',
    '<button class="btn btn-default btn-sm" onClick="reset_schedules()">Reset devices state</button>',
    '</div>',
    '</div>',
    '<div class="panel panel-default">',
    '<div class="panel-heading">',
    '<h5 class="panel-title">Available Devices</h5>',
    '</div>',
    '<div class="panel-body">',
    '<table class="table table-bordered table-condensed">',
    '<tr><th>Status</th><th>Device</th></tr>',
    '{available-devices}',
    '</table>',
    '</div>',
    '</div>',
    '<div class="panel panel-default">',
    '<div class="panel-heading">',
    '<h5 class="panel-title">Available Devicegroups</h5>',
    '</div>',
    '<div class="panel-body">',
    '<table class="table table-bordered table-condensed">',
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

  //var sortedbyday = schedulefunctions.getschedulesbyday();
    
  variables.devices.forEach(function(device, index) {
    var status_on = '';
    var status_off = '';
    var schedule_uniqueid = '';
    var schedule_time = '';
    var schedule_action = '';

    if (device.nextscheduleid.toString().length > 0) {
      var schedule = schedulefunctions.getscheduleproperty(device.nextscheduleid, '*');
      try {
        schedule_time = schedule.criterias[device.nextcriteriaid].time;
        schedule_action = sharedfunctions.firstUpperCase(variables.telldusstatus[schedule.action]);
        schedule_uniqueid = schedule.uniqueid;
      } catch (e) {
        sharedfunctions.logToFile('Error,Attempted to get information about scheduleid: ' + device.nextscheduleid + ' for Device-' + device.id, 'Core');
      }
    }


    // -- END of getting next schedule

    if (device.lastcommand == 1) {
      status_on = 'btn-success';
    }
    if (device.lastcommand == 2) {
      status_off = 'btn-success';
    }

    if (device.type == 2) {
      available_devicegroups += '<tr><td class="devicestatus vertical-middle"><button class="btn-mobile btn btn-default btn-sm ' + status_on + '" id="commandbutton_' + device.id + '_1" onClick="switchdevicestatus(\'' + device.id + '\',1);">ON</button><button class="btn-mobile btn btn-default btn-sm ' + status_off + '" id="commandbutton_' + device.id + '_2" onClick="switchdevicestatus(\'' + device.id + '\',2);">OFF</button></td><td class="vertical-middle">' + device.name + '<br>Next Schedule: <span data-toggle="tooltip" data-placement="top" title="Criteria: ' + device.nextcriteriaid + '" onclick="showscheduleinfo(\'' + schedule_uniqueid + '\')">' + schedule_time + ' ' + schedule_action + '</span></td></tr>';
    } else {
      available_devices += '<tr><td class="devicestatus vertical-middle"><button class="btn-mobile btn btn-default btn-sm ' + status_on + '" id="commandbutton_' + device.id + '_1" onClick="switchdevicestatus(\'' + device.id + '\',1);">ON</button><button class="btn-mobile btn btn-default btn-sm ' + status_off + '" id="commandbutton_' + device.id + '_2" onClick="switchdevicestatus(\'' + device.id + '\',2);">OFF</button></td><td class="vertical-middle">' + device.name + '<br>Next Schedule: <span data-toggle="tooltip" data-placement="top" title="Criteria: ' + device.nextcriteriaid + '" onclick="showscheduleinfo(\'' + schedule_uniqueid + '\')">' + schedule_time + ' ' + schedule_action + '</span></td></tr>';
    }

  });

  body = body.replace(/{available-devices}/g, available_devices);
  body = body.replace(/{available-devicegroups}/g, available_devicegroups);

  var schedulestatus = 'Running normal';
  var schedulepauseclass = '';
  var pausebutton = 'Pause';
  if (variables.pauseschedules) {
    schedulestatus = 'Paused';
    schedulepauseclass = 'bg-danger';
    pausebutton = 'Resume';
  }
  body = body.replace(/{schedulestatus}/g, schedulestatus);
  body = body.replace(/{schedulepauseclass}/g, schedulepauseclass);
  body = body.replace(/{pausebutton}/g, pausebutton);

  response.send(template.build(headline, body, true));

}

exports.get = get;