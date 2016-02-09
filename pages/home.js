var variables = require('../templates/variables');
// Define the get function that will return the content..?
function get(request, response) {
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
    '<tr><th>Status</th><th>Next Schedule</th><th>Devicegroup</th></tr>',
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
    var status_dim = '';
    var dimbutton = '';
    var schedule_uniqueid = '';
    var schedule_time = '';
    var schedule_action = '';


    // -- Start of getting next schedule --
    /*
    var allschedules = [];
    var activescheduleIndex = -1;
    var nextscheduleIndex = -1;
    for (var key in variables.schedulesbyday) {
      if (variables.schedulesbyday[key].hasOwnProperty(key)) {
        var day = variables.schedulesbyday[key];
        if (day.length > 0) {
          for (var d = 0; d < day.length; d++) {
            if (schedulefunctions.getscheduleproperty(day[d].uniqueid, 'enabled') == 'true') {
              if (device.id == day[d].deviceid) {

                allschedules.push(day[d]);
                if ((device.activescheduleid == day[d].uniqueid) && (device.activeday == key) && (day[d].criteriaid == device.activecriteriaid)) {
                  activescheduleIndex = allschedules.length - 1;
                }

              }
            }
          }
        }
      }
    }

    if (activescheduleIndex != -1) {
      if (activescheduleIndex < allschedules.length) {
        nextscheduleIndex = activescheduleIndex + 1;
      }

      if (activescheduleIndex == (allschedules.length - 1)) {
        nextscheduleIndex = 0;
      }
    }


    if (nextscheduleIndex != -1) {
      schedule.time = allschedules[nextscheduleIndex].time;
      schedule.action = schedulefunctions.getscheduleproperty(allschedules[nextscheduleIndex].uniqueid, 'action');
      schedule.uniqueid = allschedules[nextscheduleIndex].uniqueid;
      schedule.criteriaid = allschedules[nextscheduleIndex].criteriaid;
    }
    
    */

    if (device.nextscheduleid.toString().length > 0) {
        
      
      var schedule = schedulefunctions.getscheduleproperty(device.nextscheduleid, '*');
      schedule_time = schedule.criterias[device.nextcriteriaid].time;
      schedule_action = schedule.action;
      schedule_uniqueid = schedule.uniqueid;
    }
  

    // -- END of getting next schedule

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
      dimbutton = '<button disabled class="btn btn-default ' + status_dim + '" id="commandbutton_' + device.id + '_dim" onClick="switchdevicestatus(\'' + device.id + '\',\'dim\');">DIM</button>';
    }
    if (device.type == 'group') {
      available_devicegroups += '<tr><td class="devicestatus"><button class="btn btn-default ' + status_on + '" id="commandbutton_' + device.id + '_on" onClick="switchdevicestatus(\'' + device.id + '\',\'on\');">ON</button><button class="btn btn-default ' + status_off + '" id="commandbutton_' + device.id + '_off" onClick="switchdevicestatus(\'' + device.id + '\',\'off\');">OFF</button>' + dimbutton + '</td><td class="devicestatus"><span data-toggle="tooltip" data-placement="top" title="Criteria: ' + device.nextcriteriaid + '" onclick="showscheduleinfo(\'' + schedule_uniqueid + '\')">' + schedule_time + ' ' + schedule_action + '</span></td><td>' + device.name + '</td></tr>';
    } else {
      available_devices += '<tr><td class="devicestatus"><button class="btn btn-default ' + status_on + '" id="commandbutton_' + device.id + '_on" onClick="switchdevicestatus(\'' + device.id + '\',\'on\');">ON</button><button class="btn btn-default ' + status_off + '" id="commandbutton_' + device.id + '_off" onClick="switchdevicestatus(\'' + device.id + '\',\'off\');">OFF</button>' + dimbutton + '</td><td class="devicestatus"><span data-toggle="tooltip" data-placement="top" title="Criteria: ' + device.nextcriteriaid + '" onclick="showscheduleinfo(\'' + schedule_uniqueid + '\')">' + schedule_time + ' ' + schedule_action + '</span></td><td>' + device.name + '</td></tr>';
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