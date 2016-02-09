// Include the template view (Do all the presentation(?))
var variables = require('../templates/variables');
var template = require(variables.rootdir + 'templates/template-main').build;
var classes = require(variables.rootdir + 'templates/classes');
var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

function get(req, res) {
  // Check if edit of schedule is requested. Try to use the same file?
  var selected_schedule = '';
  variables.devices.forEach(function(device) {
    device.schedule.forEach(function(schedule) {
      if (schedule.uniqueid == req.query.uniqueid) {
        selected_schedule = schedule;
      }
    });
  });

  // Need to create some sort of unique ID for each sechedule.
  var headline = 'Edit Schedule';
  var body = ['<div class="panel panel-default">',
    '<div class="panel-heading">',
    'Device',
    '</div>',
    '<div class="panel-body">',
    '<div class="form-group">',
    '<select id="Select_Device" class="form-control" disabled>',
    '{select_device}',
    '</select>',
    '</div>',
    '</div>',
    '<div class="panel-heading">',
    'Schedule',
    '</div>',
    '<div class="panel-body">',
    '<div class="checkbox">',
    '<label class="checkbox-inline"><input type="checkbox" id="DayOfWeek" Value="1">Monday</label>',
    '<label class="checkbox-inline"><input type="checkbox" id="DayOfWeek" Value="2">Tuesday</label>',
    '<label class="checkbox-inline"><input type="checkbox" id="DayOfWeek" Value="3">Wednesday</label>',
    '<label class="checkbox-inline"><input type="checkbox" id="DayOfWeek" Value="4">Thursday</label>',
    '<label class="checkbox-inline"><input type="checkbox" id="DayOfWeek" Value="5">Friday</label>',
    '<label class="checkbox-inline"><input type="checkbox" id="DayOfWeek" Value="6">Saturday</label>',
    '<label class="checkbox-inline"><input type="checkbox" id="DayOfWeek" Value="0">Sunday</label>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Enabled">Schedule enabled</label>',
    '<select id="Select_Enabled" class="form-control">',
    '{selectenabled}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Action">Action</label>',
    '<select id="Select_Action" class="form-control">',
    '{selectaction}',
    '</select>',
    '</div>',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="runonce" Value="runonce" {runonce_selected}>Run Once - Remove after execution</label>',
    '</div>',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="autoremote" Value="autoremote" {autoremote_selected}>AutoRemote - Send message when triggered</label>',
    '</div>',
    '</div>',
              // Criterias
    '<div class="panel-heading">',
    'Criterias',
    '</div>',
    '<div class="panel-body">',
    '<div class="form-group">',
    '<label for="Select_Controller">Controller</label>',
    '<select id="Select_Controller" class="form-control">',
    '<option value="Time">Specific Time',
    '<option value="Sundown" title="Adjust to sundown time" {Sundown}>Sundown',
    '<option value="Sunrise" title="Adjust to the time of sunrise" {Sunrise}>Sunrise',
    '<option value="Timer">Timer',
    '</select>',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
    '<div class="form-group">',
    '<label for="Time">Time</label>',
    '<input type="text" class="form-control" id="Time" placeholder="(HH:MM)24H" value="">',
    '<br><button class="btn btn-default" onclick="schedule_add_criteria();">Add action to list</button>',
    '</div>',
    '<div class="form-group">',
    '<div class="table-responsive">',
    '<table id="schedule_criteria_table" cellpadding="0" cellspacing="0" class="table table-bordered">',
    '<tr><th>List of Criterias</th></tr>',
              '{criterialist}',
    '<tr><td><button class="btn btn-default" onclick="schedule_remove_criteria();">Remove selected actions</button></td></tr>',
    '</table>',
    '</div>',
    '</div>',
    '</div>',
              // MODIFICATIONS
    '<div class="panel-heading">',
    'Modifications',
    '</div>',
    '<div class="panel-body" id="Modificationsdiv">',
    '<div class="form-group">',
    '<label for="Select_Randomizer">Randomizer function</label>',
    '<select id="Select_Randomizer" class="form-control">',
    '{selectrandomizer}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Randomizer_Value">Randomizer max value (Minutes)</label>',
    '<select id="Select_Randomizer_Value" class="form-control">',
    '{randomizertime}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Weather_Good">Weather Impact Function - Good Weather</label>',
    '<select id="Select_Weather_Good" class="form-control">',
    '{selectweathergood}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Weather_Good_Time">Weather Impact Minutes - Good Weather </label>',
    '<select id="Select_Weather_Good_Time" class="form-control">',
    '{weathergoodtime}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Weather_Bad">Weather Impact Function - Bad Weather</label>',
    '<select id="Select_Weather_Bad" class="form-control">',
    '{selectweatherbad}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Weather_Bad_Time">Weather Impact Minutes - Bad Weather </label>',
    '<select id="Select_Weather_Bad_Time" class="form-control">',
    '{weatherbadtime}',
    '</select>',
    '</div>',
    '</div>',
    '<div class="panel-body" id="Timerdiv" style="display: none">',
    '<div class="form-group">',
    '<label for="Duration">Duration (Minutes)</label>',
    '<input type="text" class="form-control" id="Duration" placeholder="Minutes" value="{duration}">',
    '</div>',
    '</div>',
    '<div class="panel-heading" id="ModifcationBeforeHeadline">',
    'Do not trigger if schedule trigger time is before',
    '</div>',
    '<div class="panel-body" id="ModifcationBeforeBody">',
    '<div class="form-group">',
    '<label for="Select_Controller_ModifierBefore">Controller</label>',
    '<select id="Select_Controller_ModifierBefore" class="form-control">',
    '{selectmodifierbeforecontroller}',
    '</select>',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
    '<div class="form-group">',
    '<label for="IntervalNotBeforeTime">Time</label>',
    '<input type="text" class="form-control" id="IntervalNotBeforeTime" placeholder="(HH:MM)24H" value="{IntervalNotBeforeTime}">',
    '</div>',

    '</div>',
    '<div class="panel-heading" id="ModifcationAfterHeadline">',
    'Do not trigger if schedule trigger time is after',
    '</div>',
    '<div class="panel-body" id="ModifcationAfterBody">',
    '<div class="form-group">',
    '<label for="Select_Controller_ModifierAfter">Controller</label>',
    '<select id="Select_Controller_ModifierAfter" class="form-control">',
    '{selectmodifieraftercontroller}',
    '</select>',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
    '<div class="form-group">',
    '<label for="IntervalNotAfterTime">Time</label>',
    '<input type="text" class="form-control" id="IntervalNotAfterTime" placeholder="(HH:MM)24H" value="{IntervalNotAfterTime}">',
    '</div>',
    '</div>',
    '<div class="panel-footer"><button class="btn btn-default" onClick="Javascript:createschedule(\'' + selected_schedule.uniqueid + '\');">Save Edits</button></div>',
    '</div>'
  ];
  body = body.join("\n");

  var device_options = '';
  var controllermessage = '';
  var criterialist = '';
  variables.devices.forEach(function(device, index) {
    var selected_device = '';
    if (device.id == selected_schedule.deviceid) {
      selected_device = 'selected';
    }
    device_options += '<option ' + selected_device + ' value="' + device.id + '">' + device.name + '\n';
  });

  body = body.replace(/{select_device}/g, device_options);

  body = body.replace(/{selectmodifierbeforecontroller}/g, sharedfunctions.createdropdown_alphanumeric([
    ['None'],
    ['Time', 'Specific Time'],
    ['Sundown'],
    ['Sunrise']
  ], selected_schedule.intervalnotbeforecontroller));
  body = body.replace(/{selectmodifieraftercontroller}/g, sharedfunctions.createdropdown_alphanumeric([
    ['None'],
    ['Time', 'Specific Time'],
    ['Sundown'],
    ['Sunrise']
  ], selected_schedule.intervalnotaftercontroller));
  body = body.replace(/{selectcontroller}/g, sharedfunctions.createdropdown_alphanumeric([
    ['Time', 'Specific Time'],
    ['Sundown'],
    ['Sunrise'],
    ['Timer']
  ], ''));

  if (typeof(variables.weather.sys) != 'undefined') {
    // body = body.replace(/{sunrise}/g,variables.weather.sys.sunrise);
    body = body.replace(/{ControllerMessage}/g, '');
  } else {
    body = body.replace(/{Sunrise}/g, 'disabled');
    controllermessage = controllermessage + 'Sunrise controller unavailable due to no weather information found.';
  }

  if (typeof(variables.weather.sys) != 'undefined') {
    //body = body.replace(/{sundown}/g,variables.weather.sys.sunset);
    body = body.replace(/{ControllerMessage}/g, '');
  } else {
    body = body.replace(/{Sundown}/g, 'disabled');
    controllermessage = controllermessage + '<br>Sundown controller unavailable due to no weather information found.';
  }

  body = body.replace(/{ControllerMessage}/g, controllermessage);
  
  body = body.replace(/{IntervalNotBeforeTime}/g, selected_schedule.intervalnotbefore);
  body = body.replace(/{IntervalNotAfterTime}/g, selected_schedule.intervalnotafter);

  body = body.replace(/{weathergoodtime}/g, sharedfunctions.createdropdown(90, 10, selected_schedule.weathergoodtime));
  body = body.replace(/{weatherbadtime}/g, sharedfunctions.createdropdown(90, 10, selected_schedule.weatherbadtime));
  body = body.replace(/{randomizertime}/g, sharedfunctions.createdropdown(40, 5, selected_schedule.randomiser));

  body = body.replace(/{selectaction}/g, sharedfunctions.createdropdown_alphanumeric([
    ['On'],
    ['Off']
  ], selected_schedule.action));

  body = body.replace(/{selectrandomizer}/g, sharedfunctions.createdropdown_alphanumeric([
    ['+'],
    ['-'],
    ['both', '+/-']
  ], selected_schedule.randomizerfunction));
  body = body.replace(/{selectweathergood}/g, sharedfunctions.createdropdown_alphanumeric([
    ['+'],
    ['-']
  ], selected_schedule.weathergoodfunction));
  body = body.replace(/{selectweatherbad}/g, sharedfunctions.createdropdown_alphanumeric([
    ['+'],
    ['-']
  ], selected_schedule.weatherbadfunction));

  body = body.replace(/{selectenabled}/g, sharedfunctions.createdropdown_alphanumeric([
    ['true', 'Yes'],
    ['false', 'No']
  ], selected_schedule.enabled));

  body = body.replace(/{notafter}/g, selected_schedule.intervalnotafter);
  body = body.replace(/{notbefore}/g, selected_schedule.intervalnotbefore);


  selected_schedule.dayofweek.forEach(function(day) {
    var searchstring = new RegExp('id="DayOfWeek" Value="' + day + '"', "g");
    body = body.replace(searchstring, 'id="DayOfWeek" Value="' + day + '" checked=checked');
  });

  if (selected_schedule.runonce == 'true') {
    body = body.replace(/{runonce_selected}/g, 'checked=checked');
  } else {
    body = body.replace(/{runonce_selected}/g, '');
  }

  if (selected_schedule.sendautoremote == 'true') {
    body = body.replace(/{autoremote_selected}/g, 'checked=checked');
  } else {
    body = body.replace(/{autoremote_selected}/g, '');
  }
  
  selected_schedule.criterias.forEach(function(criteria) {
    criterialist += '<tr><td><span class="checkbox"><label><input type="checkbox" name="criteria_" value="' + criteria.controller + ',' + criteria.originaltime + '">' + criteria.controller + ' (' + criteria.originaltime + ')</label></span></td></tr>'
  })
  body = body.replace(/{criterialist}/g,criterialist);
  body = body.replace(/{duration}/g, selected_schedule.duration);

  res.send(template(headline, body, true));
}

exports.get = get;