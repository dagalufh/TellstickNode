exports.get = get;

function get(req, res) {
  var variables = require('../templates/variables');
  var template = require(variables.rootdir + 'templates/template-main').build;
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
  // Need to create some sort of unique ID for each sechedule.
  var headline = 'New Schedule';
  var body = ['<div class="panel panel-default">',
    '<div class="panel-heading">',
    'Device',
    '</div>',
    '<div class="panel-body">',
              // Hidden data to be used by criteria modal
    '<input type="hidden" id="ControllerMessage" value="{ControllerMessage}">',
              // End of hidden data
    '<div class="form-group">',
    '<select id="Select_Device" class="form-control input-sm">',
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
    '<label class="checkbox-inline input-sm"><input type="checkbox" id="DayOfWeek" Value="0">Sunday</label>',
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
    '<select id="ScheduleType" class="form-control input-sm">',
    '<option value="Standard">Standard',
    '<option value="Timer">Timer',
    '</select>',
    '</div>',              

    '<div class="checkbox">',
    '<label><input type="checkbox" id="runonce" Value="runonce" class="input-sm">Run Once - Remove after execution</label>',
    '</div>',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="autoremote" Value="autoremote" class="input-sm">AutoRemote - Send message when triggered</label>',
    '</div>',
    '</div>',
            
    '<div class="panel-heading">',
    'Criterias',
    '</div>',              
    // Criterias for TIMERS
    
    '<div class="panel-body for_timer">',
    '<div class="form-group">',
    '<label for="Time">Time</label>',
    '<input type="text" class="form-control input-sm" id="Time_Timer" placeholder="(HH:MM)24H" value="{initaltime}">',
    '</div>',
    '</div>',
    '<div class="panel-body for_timer">',
    '<div class="form-group">',
    '<label for="Duration">Duration (Minutes)</label>',
    '<input type="text" class="form-control input-sm" id="Duration" placeholder="Minutes" value="1">',
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
    '{selectintervalcontroller}',
    '</select><input type="text" class="form-control input-sm" id="IntervalNotBeforeTime" placeholder="(HH:MM)24H" value="">',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
              
    '<div class="form-group non_timer">',
    '<label for="Select_Controller_ModifierAfter">Do not trigger after</label>',
    '<select id="Select_Controller_ModifierAfter" class="form-control input-sm">',
    '{selectintervalcontroller}',
    '</select><input type="text" class="form-control input-sm" id="IntervalNotAfterTime" placeholder="(HH:MM)24H" value="">',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',              
    // INTERVALLS END       
    '<div class="form-group">',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="disablemodification" Value="disablemodification" class="input-sm">Disable trigger time modifications for this criteria.</label>',
    '</div>',          
    '<button class="btn btn-default btn-sm" onclick="schedule_add_criteria();">Add action to list</button>',
    '</div>',
    */
    '<div class="form-group">',
    '<div class="table-responsive">',
    '<table id="schedule_criteria_table" cellpadding="0" cellspacing="0" class="table table-condensed">',
   // '<tr><th>List of Criterias</th></tr>',
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
    '{modifiers}',
    '<option value="both">+/-',
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
    '{modifiers}',
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
    '{modifiers}',
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

    '<div class="panel-footer"><button class="btn btn-default btn-sm" onClick="Javascript:createschedule();">Create Schedule</button></div>',
    '</div>'
  ];
  body = body.join("\n");

  var device_options = '';
  var controllermessage = '';
  variables.devices.forEach(function(device, index) {
    device_options += '<option value="' + device.id + '">' + device.name + '\n';
  });

  body = body.replace(/{select_device}/g, device_options);

  var intervaloptions = [
    ['None'],
    ['Time', 'Specific Time'],
    ['Sundown'],
    ['Sunrise']
  ];
  
  body = body.replace(/{selectintervalcontroller}/g, sharedfunctions.createdropdown_alphanumeric(intervaloptions, ''));
  
  if (typeof(variables.weather.sys) != 'undefined') {
    body = body.replace(/{Sunrise}/g, variables.weather.sys.sunrise);
    body = body.replace(/{ControllerMessage}/g, '');
  } else {
    body = body.replace(/{Sunrise}/g, 'disabled');
    controllermessage = controllermessage + 'Sunrise controller unavailable due to no weather information found.';
  }

  if (typeof(variables.weather.sys) != 'undefined') {
    body = body.replace(/{Sundown}/g, variables.weather.sys.sunset);
    body = body.replace(/{ControllerMessage}/g, '');
  } else {
    body = body.replace(/{Sundown}/g, 'disabled');
    controllermessage = controllermessage + '<br>Sundown controller unavailable due to no weather information found.';
  }
  body = body.replace(/{ControllerMessage}/g, controllermessage);

  var currentdate = new Date();
  body = body.replace(/{initaltime}/g, sharedfunctions.gettwodigit(currentdate.getHours()) + ":" + sharedfunctions.gettwodigit(currentdate.getMinutes()));
  body = body.replace(/{weathertime}/g, sharedfunctions.createdropdown(90, 10));
  body = body.replace(/{randomizertime}/g, sharedfunctions.createdropdown(40, 5));
  body = body.replace(/{selectenabled}/g, sharedfunctions.createdropdown_alphanumeric([
    ['true', 'Yes'],
    ['false', 'No']
  ], ''));
  body = body.replace(/{selectaction}/g, sharedfunctions.createdropdown_alphanumeric([
    [1,'On'],
    [2,'Off']
  ], ''));
  body = body.replace(/{modifiers}/g, sharedfunctions.createdropdown_alphanumeric([
    ['+'],
    ['-']
  ], ''));

  res.send(template(headline, body, true));
}
