var variables = require('../templates/variables');
var fs = require('fs');

var devicecontrol = require(variables.rootdir + 'functions/device');
var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
var TellstickNode = require(variables.rootdir + 'TellstickNode');

function getremove(req, res) {
  var removeschedulearray = [req.query.scheduleid];
  removeschedule(removeschedulearray);
  res.send(true);
}

function removeschedule(schedulesidarray) {
  variables.schedulesbyday.forEach(function(day) {
    for (var i = 0; i < day.length; i++) {
      schedulesidarray.forEach(function(scheduletoremove) {
        if (scheduletoremove == day[i].uniqueid) {
          sharedfunctions.logToFile('Schedule,' + devicecontrol.getdeviceproperty(day[i].deviceid,'name') + ',' + day[i].uniqueid + ',REMOVED,Schedule was removed. Info that was removed: ' + JSON.stringify(day[i]), 'Device-' + day[i].deviceid);
          day.splice(i, 1);
          i = -1;
        }
      });
    }

  });
  
  variables.devices.forEach(function(device) {
    for (var i = 0; i < device.schedule.length; i++) {
      schedulesidarray.forEach(function(scheduletoremove) {
        if (scheduletoremove == device.schedule[i].uniqueid) {
          sharedfunctions.logToFile('Schedule,' + device.name + ',' + device.schedule[i].uniqueid + ',REMOVED,Schedule was removed. Info that was removed: ' + JSON.stringify(device.schedule[i]), 'Device-' + device.schedule[i].deviceid);
          device.schedule.splice(i, 1);
          i = -1;
        }
      });
    }

  });
  
  
  
  
  variables.savetofile = true;
}

function getschedule(req, res) {
  var display = [];
  var requestedschedule = '';
  var requesteddevice = '';
  var dayofweektranslate = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  };
  var dayname = '';
  var runonce = 'No';
  var status = 'Enabled';
  var autoremote = 'No';

  variables.devices.forEach(function(device) {
    device.schedule.forEach(function(schedule) {
      if (schedule.uniqueid == req.query.scheduleid) {
        requestedschedule = schedule
        requesteddevice = device;
      }
    });
  });

  requestedschedule.dayofweek.forEach(function(day) {
    dayname += dayofweektranslate[day] + ', ';
  });
  dayname = dayname.substring(0, (dayname.length - 2));

  if (requestedschedule.enabled == 'false') {
    status = 'Disabled';
  }

  if (requestedschedule.runonce == 'true') {
    runonce = 'Yes, will be removed after next trigger time.';
  }

  if (requestedschedule.sendautoremote == 'true') {
    autoremote = 'Yes';
  }

  if (requestedschedule.criterias[0].controller == 'Timer') {
    display = ['<table class="table table-bordered table-condensed">',
      '<tr><td class="td-middle">Scheduleid:</td><td>' + requestedschedule.uniqueid + '</td></tr>',
      '<tr><td>Status of Schedule:</td><td>' + status + '</td></tr>',
      '<tr><td>Device:</td><td>' + requesteddevice.name + '</td></tr>',
      '<tr><td>Start Time:</td><td>' + requestedschedule.criterias[0].originaltime + '</td></tr>',
      '<tr><td>Days of the week:</td><td>' + dayname + '</td></tr>',
      '<tr><td>Duration:</td><td>' + requestedschedule.duration + ' Minutes</td></tr>',
      '<tr><td>Controller:</td><td>' + requestedschedule.criterias[0].controller + '</td></tr>',
      '<tr><td>Action:</td><td>' + requestedschedule.action + '</td></tr>',
      '<tr><td>RunOnce:</td><td>' + runonce + '</td></tr>',
      '<tr><td>Send AutoRemote messages on trigger:</td><td>' + autoremote + '</td></tr>',
      '</table>'
    ];
  } else {
    display = ['<table class="table table-bordered table-condensed">',
      '<tr><th class="td-middle">Scheduleid:</th><th>' + requestedschedule.uniqueid + '</th></tr>',
      '<tr><td>Status of Schedule:</td><td>' + status + '</td></tr>',
      '<tr><td>Device:</td><td>' + requesteddevice.name + '</td></tr>',
      '<tr><td>RunOnce:</td><td>' + runonce + '</td></tr>',
      
      '<tr><td>Randomizer function:</td><td>' + requestedschedule.randomizerfunction + requestedschedule.randomiser + ' Minutes' + '</td></tr>',
      '<tr><td>Good Weather:</td><td>' + requestedschedule.weathergoodfunction + requestedschedule.weathergoodtime + ' Minutes' + '</td></tr>',
      '<tr><td>Bad Weather:</td><td>' + requestedschedule.weatherbadfunction + requestedschedule.weatherbadtime + ' Minutes' + '</td></tr>',
      '<tr><td>Send AutoRemote messages on trigger:</td><td>' + autoremote + '</td></tr>',
      '<tr><td>Action:</td><td>' + requestedschedule.action + '</td></tr>',
      '<tr><td>Days of the week:</td><td>' + dayname + '</td></tr>',
      '</table>'
    ];

    for (var c = 0; c < requestedschedule.criterias.length; c++) {
      display.push('<table class="table table-bordered table-condensed">')
      display.push('<tr><th class="td-middle">Criteria:</th><th>' + c + '</th></tr>');
      display.push('<tr><td>Original Time:</td><td>' + requestedschedule.criterias[c].originaltime + '</td></tr>');
      display.push('<tr><td>Next trigger time:</td><td>' + requestedschedule.criterias[c].time + '</td></tr>');
      display.push('<tr><td>Controller:</td><td>' + requestedschedule.criterias[c].controller + '</td></tr>');
      display.push('<tr><td>Do not run if current time is before:</td><td>' + requestedschedule.criterias[c].intervalnotbeforecontroller + '(' + requestedschedule.criterias[c].intervalnotbefore + ')' + '</td></tr>');
      display.push('<tr><td>Do not run if current time is after:</td><td>' + requestedschedule.criterias[c].intervalnotaftercontroller + '(' + requestedschedule.criterias[c].intervalnotafter + ')' + '</td></tr>');
      //display.push('<tr><td>Randomizer function:</td><td>' + requestedschedule.criterias[c].randomizerfunction + requestedschedule.criterias[c].randomiser + ' Minutes' + '</td></tr>');
      //display.push('<tr><td>Good Weather:</td><td>' + requestedschedule.criterias[c].weathergoodfunction + requestedschedule.criterias[c].weathergoodtime + ' Minutes' + '</td></tr>');
      //display.push('<tr><td>Bad Weather:</td><td>' + requestedschedule.criterias[c].weatherbadfunction + requestedschedule.criterias[c].weatherbadtime + ' Minutes' + '</td></tr>');
      display.push('</table>');
    }

  }
  res.send(display.join('\n'));
}

function highlightactiveschedule(callback) {
  var currenttimestamp = new Date();
  var today = currenttimestamp.getUTCDay();

  var hour = '0' + currenttimestamp.getHours();
  var minutes = '0' + currenttimestamp.getMinutes();
  hour = hour.substr(hour.length - 2);
  minutes = minutes.substr(minutes.length - 2);
  var currenttime = hour + ":" + minutes;

  variables.devices.forEach(function(device) {
    device.nextscheduleid = '';
    device.nextcriteriaid = '';
    var startday = today + 1; // This is so we start with tomorrow and continue untill we reach today.
    var todayreached = false;
    if (today == 6) {
      startday = 0;
    }

    var schedulefound = false;

    do {
      // check if we are on 'today'
      if (startday == today) {
        todayreached = true;
      }

      var day = variables.schedulesbyday[startday];
      for (var i = 0; i < day.length; i++) {
        if (todayreached) {
          if (currenttime < day[i].time) {
            break;
          }
        }

        // only highlight to those that are enabled.
        if (getscheduleproperty(day[i].uniqueid, 'enabled') == 'true') {
          if (day[i].deviceid == device.id) {
            device.activescheduleid = day[i].uniqueid;
            device.currentstatus = getscheduleproperty(day[i].uniqueid, 'action');
            device.activeday = startday;
            device.activecriteriaid = day[i].criteriaid;
          }
        }

      }

      if (startday == 6) {
        startday = 0;
      } else {
        startday++;
      }

    } while (todayreached === false);

    // -- Start of getting next schedule --

    var allschedules = [];
    var activescheduleIndex = -1;
    var nextscheduleIndex = -1;
    for (var key in variables.schedulesbyday) {
      if (variables.schedulesbyday[key].hasOwnProperty(key)) {
        var day = variables.schedulesbyday[key];
        if (day.length > 0) {
          for (var d = 0; d < day.length; d++) {
            if (getscheduleproperty(day[d].uniqueid, 'enabled') == 'true') {
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
      device.nextscheduleid = allschedules[nextscheduleIndex].uniqueid;
      device.nextcriteriaid = allschedules[nextscheduleIndex].criteriaid;
    }

    // -- END of getting next schedule
  });

  if (callback) {
    callback();
  }
}

function getscheduleproperty(param_uniqueid, param_property) {
  for (var d = 0; d < variables.devices.length; d++) {
    for (var s = 0; s < variables.devices[d].schedule.length; s++) {
      if (variables.devices[d].schedule[s].uniqueid == param_uniqueid) {
        if (param_property == '*') {
          return variables.devices[d].schedule[s];
        } else {
          return variables.devices[d].schedule[s][param_property];
        }
      }
    }

  }

}

function getpauseschedules(req, res) {
  var message = 'Running normal';
  if (variables.pauseschedules) {
    variables.pauseschedules = false;
  } else {
    variables.pauseschedules = true;
    message = 'Paused';
  }

  sharedfunctions.logToFile('Schedule,Pause Schedules is set to ' + variables.pauseschedules, 'Core');
  TellstickNode.sendtoclient([{
    device: 'pausedschedules:' + message + ':' + variables.pauseschedules
  }]);
  res.send(true);
}

exports.getscheduleproperty = getscheduleproperty;
exports.getpauseschedules = getpauseschedules;
exports.highlightactiveschedule = highlightactiveschedule;
exports.removeschedule = removeschedule;
exports.getremove = getremove;
exports.getschedule = getschedule;
// Perhaps see if we can limit reading of schedules from file to only be when saving new schedule or removing old one. Not during runtime.