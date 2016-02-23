// Include the template view (Do all the presentation(?))
var variables = require('../templates/variables');
var template = require(variables.rootdir + 'templates/template-main');
var saltedpasswords = require(variables.rootdir + 'functions/saltedpasswords.js').saltedpasswords;
var schedulefunctions = require(variables.rootdir + 'functions/schedulefunctions');
var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

// Define the get function that will return the content..?
function get(request, response) {
 // Include the template view (Do all the presentation(?))
  var template = require(variables.rootdir + 'templates/template-main');
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
  var schedulefunctions = require(variables.rootdir + 'functions/schedulefunctions');
  var classes = require(variables.rootdir + 'templates/classes');
  // Define the different parts of the page.
  var headline = 'Remote';
  var body = ['<div class="panel panel-default">',
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
  
  response.send(template.build(headline, body, true));
}

exports.get = get;