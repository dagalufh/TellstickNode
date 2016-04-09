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
              // Hidden data to be used by criteria modal
    '<input type="hidden" id="ControllerMessage" value="{ControllerMessage}">',
              // End of hidden data
    '<div class="form-group">',
    '<select id="Select_Device" class="form-control input-sm" disabled>',
    '{select_device}',
    '</select>',
    '</div>',
    '</div>',
    '<div class="panel-heading">',
    'Schedule',
    '</div>',
    '<div class="panel-body">',
    '<div class="checkbox">',
    '<label class="checkbox-inline input-sm"><input type="checkbox" id="DayOfWeek" Value="1">Monday</label>',
    '<label class="checkbox-inline input-sm"><input type="checkbox" id="DayOfWeek" Value="2">Tuesday</label>',
    '<label class="checkbox-inline input-sm"><input type="checkbox" id="DayOfWeek" Value="3">Wednesday</label>',
    '<label class="checkbox-inline input-sm"><input type="checkbox" id="DayOfWeek" Value="4">Thursday</label>',
    '<label class="checkbox-inline input-sm"><input type="checkbox" id="DayOfWeek" Value="5">Friday</label>',
    '<label class="checkbox-inline input-sm"><input type="checkbox" id="DayOfWeek" Value="6">Saturday</label>',
    '<label class="checkbox-inline input-sn"><input type="checkbox" id="DayOfWeek" Value="0">Sunday</label>',
    '<button class="btn btn-default btn-sm" onclick="select_all_days();">Select All/None</button>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Enabled">Schedule enabled</label>',
    '<select id="Select_Enabled" class="form-control input-sm">',
    '{selectenabled}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Action">Action</label>',
    '<select id="Select_Action" class="form-control input-sm">',
    '{selectaction}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="ScheduleType">Scheduletype</label>',
    '<select id="ScheduleType" class="form-control input-sm" disabled>',
    '<option value="Standard" {standardschedule}>Standard',
    '<option value="Timer" {timerschedule}>Timer',
    '</select>',
    '</div>',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="runonce" Value="runonce" {runonce_selected} class="input-sm">Run Once - Remove after execution</label>',
    '</div>',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="autoremote" Value="autoremote" {autoremote_selected} class="input-sm">AutoRemote - Send message when triggered</label>',
    '</div>',
    '</div>',
    '<div class="panel-heading">',
    'Criterias',
    '</div>',
    // Criterias for TIMERS

    '<div class="panel-body for_timer">',
    '<div class="form-group">',
    '<label for="Time">Time</label>',
    '<input type="text" class="form-control input-sm" id="Time_Timer" placeholder="(HH:MM)24H" value="{time_timer}">',
    '</div>',
    '</div>',
    '<div class="panel-body for_timer">',
    '<div class="form-group">',
    '<label for="Duration">Duration (Minutes)</label>',
    '<input type="text" class="form-control input-sm" id="Duration" placeholder="Minutes" value="{duration}">',
    '</div>',
    '</div>',
    // Criterias for STANDARD SCHEDULES

    '<div class="panel-body non_timer">',
              /*
    '<div class="form-group">',
    '<label for="Select_Controller">Controller</label>',
    '<select id="Select_Controller" class="form-control input-sm">',
    '<option value="Time">Specific Time',
    '<option value="Sundown" title="Adjust to sundown time" {Sundown}>Sundown',
    '<option value="Sunrise" title="Adjust to the time of sunrise" {Sunrise}>Sunrise',
    '</select>',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
    '<div class="form-group">',
    '<label for="Time">Time</label>',
    '<input type="text" class="form-control input-sm" id="Time" placeholder="(HH:MM)24H" value="{initaltime}">',
    '</div>',
    // INTERVALLS BEGIN       

    '<div class="form-group non_timer">',
    '<label for="Select_Controller_ModifierBefore">Do not trigger before</label>',
    '<select id="Select_Controller_ModifierBefore" class="form-control input-sm">',
    '{selectmodifiercontroller}',
    '</select><input type="text" class="form-control input-sm" id="IntervalNotBeforeTime" placeholder="(HH:MM)24H" value="">',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',

    '<div class="form-group non_timer">',
    '<label for="Select_Controller_ModifierAfter">Do not trigger after</label>',
    '<select id="Select_Controller_ModifierAfter" class="form-control input-sm">',
    '{selectmodifiercontroller}',
    '</select><input type="text" class="form-control input-sm" id="IntervalNotAfterTime" placeholder="(HH:MM)24H" value="">',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
    // INTERVALLS END       
    '<div class="form-group">',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="disablemodification" Value="disablemodification" class="input-sm">Disable trigger time modifications for this criteria.</label>',
    '</div>',
    '<br><button class="btn btn-default btn-sm" onclick="schedule_add_criteria();">Add action to list</button>',
    '</div>',
    */
    '<div class="form-group">',
    '<div class="table-responsive">',
    '<table id="schedule_criteria_table" cellpadding="0" cellspacing="0" class="table table-condensed">',
    //'<tr><th>List of Criterias</th></tr>',
    '{criterialist}',
    '<tr><td colspan="2"><button class="btn btn-default btn-sm" onclick="criteria_modal();">Add new criteria to list</button> <button class="btn btn-default btn-sm" onclick="schedule_remove_criteria();">Remove selected actions</button></td></tr>',
    '</table>',
    '</div>',
    '</div>',
    '</div>',
    // Modifications
    '<div class="panel-heading non_timer">',
    'Modifications',
    '</div>',
    '<div class="panel-body" id="Modificationsdiv non_timer">',
    '<div class="form-group non_timer">',
    '<label for="Select_Randomizer">Randomizer function</label>',
    '<select id="Select_Randomizer" class="form-control input-sm">',
    '{selectrandomizer}',
    '</select>',
    '</div>',
    '<div class="form-group non_timer">',
    '<label for="Select_Randomizer_Value">Randomizer max value (Minutes)</label>',
    '<select id="Select_Randomizer_Value" class="form-control input-sm">',
    '{randomizertime}',
    '</select>',
    '</div>',
    '<div class="form-group non_timer">',
    '<label for="Select_Weather_Good">Weather Impact Function - Good Weather</label>',
    '<select id="Select_Weather_Good" class="form-control input-sm">',
    '{selectweathergood}',
    '</select>',
    '</div>',
    '<div class="form-group non_timer">',
    '<label for="Select_Weather_Good_Time">Weather Impact Minutes - Good Weather </label>',
    '<select id="Select_Weather_Good_Time" class="form-control input-sm">',
    '{weathertime}',
    '</select>',
    '</div>',
    '<div class="form-group non_timer">',
    '<label for="Select_Weather_Bad">Weather Impact Function - Bad Weather</label>',
    '<select id="Select_Weather_Bad" class="form-control input-sm">',
    '{selectweatherbad}',
    '</select>',
    '</div>',
    '<div class="form-group non_timer">',
    '<label for="Select_Weather_Bad_Time">Weather Impact Minutes - Bad Weather </label>',
    '<select id="Select_Weather_Bad_Time" class="form-control input-sm">',
    '{weathertime}',
    '</select>',
    '</div>',
    '</div>',

    '</div>',
    '<div class="panel-footer"><button class="btn btn-default btn-sm" onClick="Javascript:createschedule(\'' + selected_schedule.uniqueid + '\');">Save Edits</button></div>',
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

  body = body.replace(/{weathergoodtime}/g, sharedfunctions.createdropdown(90, 10, selected_schedule.weathergoodtime));
  body = body.replace(/{weatherbadtime}/g, sharedfunctions.createdropdown(90, 10, selected_schedule.weatherbadtime));
  body = body.replace(/{randomizertime}/g, sharedfunctions.createdropdown(40, 5, selected_schedule.randomiser));

  body = body.replace(/{selectaction}/g, sharedfunctions.createdropdown_alphanumeric([
    [1, 'On'],
    [2, 'Off']
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

  if (selected_schedule.criterias[0].controller == 'Timer') {
    body = body.replace(/{timerschedule}/g, 'selected');
    body = body.replace(/{standardschedule}/g, '');
    body = body.replace(/{time_timer}/g, selected_schedule.criterias[0].time);
    body = body.replace(/{duration}/g, selected_schedule.duration);
  } else {
    body = body.replace(/{standardschedule}/g, 'selected');
    body = body.replace(/{timerschedule}/g, '');
  }

  var intervaloptions = [
    ['None'],
    ['Time', 'Specific Time'],
    ['Sundown'],
    ['Sunrise']
  ];
  
 
  
  selected_schedule.criterias.forEach(function(criteria) {
    var intervalshow = ''
    var modifiers = 'enabled';
    
    if (criteria.disablemodifiers == 'true') {
      modifiers = 'disabled';
    }
    intervaloptions.push(['criteriaid:'+criteria.criteriaid,'Criteria (ID: ' + criteria.criteriaid + ') ' + criteria.controller + '(' + criteria.originaltime + ')']);
    var interval = criteria.intervalnotbeforecontroller + ',' + criteria.intervalnotbefore + ',' + criteria.intervalnotaftercontroller + ',' + criteria.intervalnotafter + ',' + criteria.disablemodifiers;
    intervalshow = ' if time is within the interval of ' + criteria.intervalnotbeforecontroller + '(' + criteria.intervalnotbefore + ') and ' + criteria.intervalnotaftercontroller + '(' + criteria.intervalnotafter + '). Modifiers are ' + modifiers;

    criterialist += '<tr><td class="td-small"><button class="btn btn-default btn-sm" onclick="criteria_modal(\''+ criteria.criteriaid +'\')">Edit</button></td><td><span class="checkbox"><label><input type="checkbox" name="criteria_" value="' + criteria.criteriaid + ',' + criteria.controller + ',' + criteria.originaltime + ',' + interval + '"> (ID: ' + criteria.criteriaid + ')' + criteria.controller + ' (' + criteria.originaltime + ')' + intervalshow + '</label></span></td></tr>'
  })

  var currentdate = new Date();
  body = body.replace(/{initaltime}/g, sharedfunctions.gettwodigit(currentdate.getHours()) + ":" + sharedfunctions.gettwodigit(currentdate.getMinutes()));

  body = body.replace(/{weathertime}/g, sharedfunctions.createdropdown(90, 10));
  body = body.replace(/{criterialist}/g, criterialist);

   body = body.replace(/{selectmodifiercontroller}/g, sharedfunctions.createdropdown_alphanumeric(intervaloptions, 'None'));
  
  res.send(template(headline, body, true));
}

exports.get = get;