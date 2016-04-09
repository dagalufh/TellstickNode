function get(request, response) {
  var variables = require('../templates/variables');
  var template = require(variables.rootdir + 'templates/template-main');
  var schedulefunctions = require(variables.rootdir + 'functions/schedulefunctions');
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
  var currenttimestamp = new Date();
  var today = currenttimestamp.getUTCDay();

  // Define the different parts of the page.
  var headline = 'View All Schedules';
  var body = ['<div class="panel panel-default">',
    '<div class="panel-heading">',
    '<h5 class="panel-title">Filter view</h5>',
    '</div>',
    '<div class="panel-body">',
    '<table class="table table-bordered table-condensed">',
    '<tr><td class="td-middle">By device:</td><td><select id="devicetoview" class="input-sm">{devicetoview}</select></td></tr>',
    '<tr><td class="td-middle">Schedules with status:</td><td><select id="schedulestoview" class="input-sm">{schedulestoview}</select></td></tr>',
    '<tr><td><button class="btn btn-default btn-sm" onclick="filter();">Filter</button></td></tr>',
    '</table>',
    '</div>',
    '</div>',
    '<div class="panel panel-default">',
    '<div class="panel-heading">',
    '<h5 class="panel-title">Timers</h5>',
    '</div>',
    '<div class="panel-body">',
    '<div class="table-responsive">',
    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered table-condensed">',
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
    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered table-condensed">',
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
    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered table-condensed">',
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
  function display_devices() {
    var device_options = '';
    var schedules = '<tr><th>Device</th><th>Action</th><th>Day of Week</th><th>Criteria</th><th></th></tr>';
    var timers = '<tr><th>Device</th><th>Duration</th><th>Day of Week</th><th>Time</th><th></th></tr>';
    var dayofweektranslate = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    };
    var devicetoview = '';
    var selected_deviceid = -1;
    var selected_scheduletype = '';
    var schedulesfound = false;
    var timersfound = false;

    if (typeof(request.query.deviceid) != 'undefined') {
      selected_deviceid = Number(request.query.deviceid);
    }

    if (typeof(request.query.scheduletype) != 'undefined') {
      selected_scheduletype = request.query.scheduletype;
    }


    variables.devices.forEach(function(device, index) {

      if (device.id == selected_deviceid) {
        devicetoview = devicetoview + '<option selected value="' + device.id + '">' + device.name;
      } else {
        devicetoview = devicetoview + '<option value="' + device.id + '">' + device.name;
      }

      device_options += '<option value="' + device.id + '">' + device.name + '\n';


      if (device.schedule.length > 0) {
        device.schedule.sort(sharedfunctions.dynamicSortMultiple('dayofweek', 'earliest'));
        device.schedule.forEach(function(singleschedule) {
          
          var dayname = '';
          var activeschedule = '';

          singleschedule.dayofweek.forEach(function(day) {
            dayname += dayofweektranslate[day] + ', ';
          });
          dayname = dayname.substring(0, (dayname.length - 2));

          if (device.activescheduleid == singleschedule.uniqueid) {
            activeschedule = 'class="bg-success"';
          }

          if (singleschedule.enabled == 'false') {
            activeschedule = 'class="bg-danger"';
          }
          
          var criterias = '';
          singleschedule.criterias.forEach(function (criteria) {
            criterias += criteria.controller + '(' + criteria.time + '), ';
          })
          criterias = criterias.substring(0,criterias.length-2);
  
          if ((device.id == selected_deviceid) || (selected_deviceid === -1)) {
            if ((selected_scheduletype === '') || (selected_scheduletype == singleschedule.enabled)) {
             if (criterias.indexOf('Timer') === -1) {
                schedulesfound = true;
                var editable = '';
                if (singleschedule.uniqueid.toString().indexOf('watcher') != -1) {
                  editable = 'disabled';
                }
                schedules += '<tr><td ' + activeschedule + ' onclick="showscheduleinfo(\'' + singleschedule.uniqueid + '\')">' + device.name + '</td><td ' + activeschedule + '>' + sharedfunctions.firstUpperCase(variables.telldusstatus[singleschedule.action]) + '</td><td ' + activeschedule + '>' + dayname + '</td><td ' + activeschedule + '>' + criterias + '</td><td ' + activeschedule + '><a class="btn btn-default btn-sm" href="/editschedule?uniqueid=' + singleschedule.uniqueid + '" ' + editable + '>Edit</a><button class="btn btn-default btn-sm" onclick="removeschedule(\'' + singleschedule.uniqueid + '\')">Remove</button></td></tr>';
             } else {
               timersfound = true;
               timers += '<tr><td ' + activeschedule + ' onclick="showscheduleinfo(\'' + singleschedule.uniqueid + '\')">' + device.name + '</td><td ' + activeschedule + '>' + singleschedule.duration + ' minutes</td><td ' + activeschedule + '>' + dayname + '</td><td ' + activeschedule + '>' + singleschedule.criterias[0].time + '</td><td ' + activeschedule + '><a class="btn btn-default btn-sm" href="/editschedule?uniqueid=' + singleschedule.uniqueid + '">Edit</a><button class="btn btn-default btn-sm" onclick="removeschedule(\'' + singleschedule.uniqueid + '\')">Remove</button></td></tr>';
             }
            }
          }
        });
      }

    });
    // Testing new shcedulethingy
    
    var schedulesbyday = '';
    var schedulesbydayfound = false;
    for (var key in variables.schedulesbyday) {
     
      if (variables.schedulesbyday[key].length > 0) {
     
        var day = variables.schedulesbyday[key];

        schedulesbyday += '<tr><th colspan="5">' + dayofweektranslate[key] + '</th></tr><tr><th>Name</th><th class="td-140">Identifier</th></tr>';
        if (day.length > 0) {
          day.sort(sharedfunctions.dynamicSortMultiple('time'));

          day.forEach(function(criteria) {
            var devicename = '';
            var activeschedule = '';
            variables.devices.forEach(function(device) {
              if (device.id == criteria.deviceid) {
                devicename = device.name;
              }

              if ((device.activescheduleid == criteria.uniqueid) && (device.activeday == key)) {
                activeschedule = 'bg-success';

              }
            });
            if ((criteria.deviceid == selected_deviceid) || (selected_deviceid === -1)) {
              if (criteria.controller != 'Timer') {
                schedulesbydayfound = true;
                var schedule = schedulefunctions.getscheduleproperty(criteria.uniqueid,'*');
                if (typeof(schedule) == 'undefined') {
                  console.log(criteria);
                }
                  var controller = schedule.criterias[criteria.criteriaid].controller;
                  var identifier = criteria.uniqueid + ':' + criteria.criteriaid;
                  schedulesbyday += '<tr><td class="' + activeschedule + '">' + devicename + '<br>' + sharedfunctions.firstUpperCase(variables.telldusstatus[schedule.action]) + ' at ' + controller + '(' + criteria.time + ')</td><td class="' + activeschedule + '">' + identifier + '</td></tr>';
             
              }
            }
          });
        }
      }
    }

    if (schedulesfound === false) {
      schedules = '<tr><td><p class="text-info">No schedules found.</p></td></tr>';
    }
    if (timersfound === false) {
      timers = '<tr><td><p class="text-info">No timers found.</p></td></tr>';
    }

    if (schedulesbydayfound === false) {
      schedulesbyday = '<tr><td><p class="text-info">No schedules found.</p></td></tr>';
    }

    devicetoview = '<option value="-1">All' + devicetoview;
    // End of testing
    body = body.replace(/{scheduled-devices-by-day}/g, schedulesbyday);
    body = body.replace(/{scheduled-devices}/g, schedules);
    body = body.replace(/{select_device}/g, device_options);
    body = body.replace(/{Timers}/g, timers);
    body = body.replace(/{devicetoview}/g, devicetoview);
    body = body.replace(/{schedulestoview}/g, sharedfunctions.createdropdown_alphanumeric([
      ['', 'Any'],
      ['true', 'Enabled'],
      ['false', 'Disabled']
    ], selected_scheduletype));
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

}

exports.get = get;