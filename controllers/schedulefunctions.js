var variables = require('../model/variables');
var fs = require('fs');

var devicecontrol = require('./device');
var sharedfunctions = require('../model/sharedfunctions');
var TellstickNode = require('../TellstickNode');

function getremove(req,res) {
    var removeschedulearray = [req.query.scheduleid];
    removeschedule(removeschedulearray);
    res.send(true);
}

function removeschedule(schedulesidarray) {
    variables.devices.forEach( function(device) {
        for (var i = 0; i < device.schedule.length; i++) {
            schedulesidarray.forEach(function(scheduletoremove) {
                if(scheduletoremove == device.schedule[i].uniqueid) {
                    sharedfunctions.logToFile('Schedule,'+ device.name+','+ device.schedule[i].uniqueid+',REMOVED,Schedule was removed. Info that was removed: ' + JSON.stringify(device.schedule[i]),'Device-'+device.schedule[i].deviceid);
                    device.schedule.splice(i,1);
                    i=0;
                }
            });
        }
        
    });
    variables.savetofile = true;
}

// Change this to be a per device thingy..
function getschedulesbyday() {
    var daysoftheweek = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
    variables.devices.forEach(function(device) {
        device.schedule.forEach(function (schedule) {
            schedule.dayofweek.forEach( function (day) {
                daysoftheweek[day].push(schedule);
            });
        });
    });

    return daysoftheweek;
}

function getschedule(req,res) {
    var requestedschedule = '';
    var requesteddevice = '';
    var dayofweektranslate = {0:'Sunday',1:'Monday',2:'Tuesday',3:'Wednesday',4:'Thursday',5:'Friday',6:'Saturday'};
    var dayname = '';
    var runonce = 'No';
    var status = 'Enabled';
    var autoremote = 'No';
    
    variables.devices.forEach(function(device) {
        device.schedule.forEach(function (schedule) {
            if (schedule.uniqueid == req.query.scheduleid) {
                requestedschedule = schedule
                requesteddevice = device;
            }
        });
    });
    
    requestedschedule.dayofweek.forEach(function(day) {
        dayname += dayofweektranslate[day] + ', ';
    });
    dayname = dayname.substring(0,(dayname.length-2));
    
    if (requestedschedule.enabled == 'false') {
        status = 'Disabled';
    }
    
    if (requestedschedule.runonce == 'true') {
        runonce = 'Yes, will be removed after next trigger time.';
    }
    
    if (requestedschedule.sendautoremote == 'true') {
        autoremote = 'Yes';
    }

    if (requestedschedule.controller == 'Timer') {
        var display = ['<table class="table table-bordered table-condensed">',
                        '<tr><td>Scheduleid:</td><td>' + requestedschedule.uniqueid + '</td></tr>',
                        '<tr><td>Status of Schedule:</td><td>' + status + '</td></tr>',
                        '<tr><td>Device:</td><td>' + requesteddevice.name + '</td></tr>',
                        '<tr><td>Start Time:</td><td>' + requestedschedule.originaltime + '</td></tr>',
                        '<tr><td>Days of the week:</td><td>' + dayname + '</td></tr>',
                        '<tr><td>Duration:</td><td>' + requestedschedule.duration + ' Minutes</td></tr>',
                        '<tr><td>Controller:</td><td>' + requestedschedule.controller + '</td></tr>',
                        '<tr><td>Action:</td><td>' + requestedschedule.action + '</td></tr>',
                        '<tr><td>RunOnce:</td><td>' + runonce + '</td></tr>',
                        '<tr><td>Send AutoRemote messages on trigger:</td><td>' + autoremote + '</td></tr>',
                        '</table>'];    
    } else {
        var display = ['<table class="table table-bordered table-condensed">',
                       '<tr><td>Scheduleid:</td><td>' + requestedschedule.uniqueid + '</td></tr>',
                    '<tr><td>Status of Schedule:</td><td>' + status + '</td></tr>',
                    '<tr><td>Device:</td><td>' + requesteddevice.name + '</td></tr>',
                    '<tr><td>Original Time:</td><td>' + requestedschedule.originaltime + '</td></tr>',
                    '<tr><td>Next trigger time:</td><td>' + requestedschedule.time + '</td></tr>',
                    '<tr><td>Days of the week:</td><td>' + dayname + '</td></tr>',                
                    '<tr><td>Controller:</td><td>' + requestedschedule.controller + '</td></tr>',
                    '<tr><td>Action:</td><td>' + requestedschedule.action + '</td></tr>',
                    '<tr><td>Randomizer function:</td><td>' + requestedschedule.randomizerfunction + requestedschedule.randomiser + ' Minutes' + '</td></tr>',
                    '<tr><td>Good Weather:</td><td>' + requestedschedule.weathergoodfunction + requestedschedule.weathergoodtime + ' Minutes' + '</td></tr>',
                    '<tr><td>Bad Weather:</td><td>' + requestedschedule.weatherbadfunction + requestedschedule.weatherbadtime + ' Minutes' + '</td></tr>',
                    '<tr><td>RunOnce:</td><td>' + runonce + '</td></tr>',                    
                    '<tr><td>Do not run if current time is before:</td><td>' + requestedschedule.intervalnotbeforecontroller + '(' + requestedschedule.intervalnotbefore +')' + '</td></tr>',
                    '<tr><td>Do not run if current time is after:</td><td>' + requestedschedule.intervalnotaftercontroller + '(' + requestedschedule.intervalnotafter +')' + '</td></tr>',
                    '<tr><td>Send AutoRemote messages on trigger:</td><td>' + autoremote + '</td></tr>',
                      '</table>'];
    }
    res.send(display.join('\n'));
}

function highlightactiveschedule(callback) {
    var currenttimestamp = new Date();
    var today = currenttimestamp.getUTCDay();

    var hour = '0' + currenttimestamp.getHours();
    var minutes = '0' + currenttimestamp.getMinutes();
    hour = hour.substr(hour.length-2);
    minutes = minutes.substr(minutes.length-2);
    var currenttime = hour + ":" + minutes;



    variables.devices.forEach(function(device) {
        device.nextschedule = 'none';
        var startday = today+1;
        var todayreached = false;
        if (today == 6) {
            startday = 0;
        }


        // For EACH device
        var daysoftheweek = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
        // Store each schedule in the right day of the week
        device.schedule.forEach(function (schedule) {

            if (schedule.enabled == 'true') {
                schedule.dayofweek.forEach( function (day) {
                    if(schedule.controller != 'Timer') {
                        daysoftheweek[day].push(schedule);
                    }
                });
            }
        });

        // Sort the times for each day so they are in the right order
        for (var key in daysoftheweek) {
            if (daysoftheweek.hasOwnProperty(key)) {
                var day = daysoftheweek[key];
                if(day.length > 0) {
                    day.sort(sharedfunctions.dynamicSortMultiple('time'));
                }
            }
        }

        var schedulefound = false;

        do {
            // check if we are on 'today'
            if (startday == today) {
                todayreached = true;
            }

            var day = daysoftheweek[startday];
            for (var i = 0; i < day.length; i++) {

                if (todayreached) {
                    if (currenttime > day[i].time) {

                        device.activescheduleid = day[i].uniqueid;
                        device.currentstatus = day[i].action;
                        device.activeday = startday;
                    }else if (currenttime < day[i].time) {
                        if (device.nextschedule == 'none') {
                            device.nextschedule = day[i].uniqueid;   
                        } else {
                            break;
                        }
                    }else {
                        break;
                    }
                } else {
                        device.activescheduleid = day[i].uniqueid;
                        device.currentstatus = day[i].action;
                        device.activeday = startday;
                }
            };

            if (startday == 6) {
                startday = 0;
            } else {
                startday++;
            }

        } while (todayreached == false);
        
    });
    
    if (callback) {
        callback();
    }
}

function  getpauseschedules(req,res) {
    var message = 'Running normal';
    if (variables.pauseschedules) {
        variables.pauseschedules = false;
    } else {
        variables.pauseschedules = true;
        message = 'Paused';
    }

    sharedfunctions.logToFile('Schedule,Pause Schedules is set to ' + variables.pauseschedules,'Core');
    TellstickNode.sendtoclient([{device: 'pausedschedules:'+ message+':'+variables.pauseschedules}]);
    res.send(true);
}


exports.getpauseschedules = getpauseschedules;
exports.highlightactiveschedule = highlightactiveschedule;
exports.removeschedule = removeschedule;
exports.getschedulesbyday = getschedulesbyday;
exports.getremove = getremove;
exports.getschedule = getschedule;
// Perhaps see if we can limit reading of schedules from file to only be when saving new schedule or removing old one. Not during runtime.