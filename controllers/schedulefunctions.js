var variables = require('../model/variables');
var fs = require('fs');

var devicecontrol = require('./device');
var sharedfunctions = require('../model/sharedfunctions');
var TellstickNode = require('../TellstickNode');

function getremove(req,res) {
    var removeschedulearray = [req.query.scheduleid];
    //console.log(req.query);
    removeschedule(removeschedulearray);
    res.send(true);
}

function removeschedule(schedulesidarray) {
    variables.devices.forEach( function(device) {
        for (var i = 0; i < device.schedule.length; i++) {
            schedulesidarray.forEach(function(scheduletoremove) {
                //console.log(scheduletoremove + "==" + device.schedule[i].uniqueid);
                if(scheduletoremove == device.schedule[i].uniqueid) {
                    console.log('Schedule ' + device.schedule[i].uniqueid + ' was removed.');
                    sharedfunctions.log('Schedule ' + device.schedule[i].uniqueid + ' was removed.');
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


function highlightactiveschedule() {
    var currenttimestamp = new Date();
    var today = currenttimestamp.getUTCDay();

    var hour = '0' + currenttimestamp.getHours();
    var minutes = '0' + currenttimestamp.getMinutes();
    hour = hour.substr(hour.length-2);
    minutes = minutes.substr(minutes.length-2);
    var currenttime = hour + ":" + minutes;


    //console.log('Inside Resetstatusfunction();');
    variables.devices.forEach(function(device) {

        var startday = today+1;
        var todayreached = false;
        if (today == 6) {
            startday = 0;
        }

       // console.log('Checking latest status for: ' + device.name);
        // For EACH device
        var daysoftheweek = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
        // Store each schedule in the right day of the week
        device.schedule.forEach(function (schedule) {
            schedule.dayofweek.forEach( function (day) {
                //console.log('Found a schedule');
                //console.log('Pushing it to daysoftheweek['+day+'] with id:' + schedule.uniqueid);
                //console.log(schedule);
                if(schedule.controller != 'Timer') {
                    daysoftheweek[day].push(schedule);
                }
            });
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
                    //console.log('For loop - today reached');
                    //console.log(currenttime + '>' + day[i].time);
                    if (currenttime > day[i].time) {
                       //console.log('Found a schedule that has already happend. Saving its time and ID.');

                        device.activescheduleid = day[i].uniqueid;
                        device.currentstatus = day[i].action;
                        device.activeday = startday;
                        //console.log('Schedule Unique ID: ' + day[i].uniqueid + ' and action: ' + day[i].action + ' on day ' + i );
                    } else {
                        //console.log('Breaking..');
                        break;
                    }
                } else {
                        device.activescheduleid = day[i].uniqueid;
                        device.currentstatus = day[i].action;
                        device.activeday = startday;
                }
            };

            if (startday == 6) {
               // console.log('Reset startday to 0.');
                startday = 0;
            } else {
               // console.log('Increased startday');
                startday++;
            }

        } while (todayreached == false);

    });
}

function  getpauseschedules(req,res) {
    var message = 'Running normal';
    if (variables.pauseschedules) {
        variables.pauseschedules = false;
    } else {
        variables.pauseschedules = true;
        message = 'Paused';
    }
    
    console.log('Pause Schedules set to: ' + variables.pauseschedules);
    sharedfunctions.log('Pause Schedules set to: ' + variables.pauseschedules);
    
    TellstickNode.sendtoclient([{device: 'pausedschedules:'+ message+':'+variables.pauseschedules}]);
    res.send(true);
}


exports.getpauseschedules = getpauseschedules;
exports.highlightactiveschedule = highlightactiveschedule;
exports.removeschedule = removeschedule;
exports.getschedulesbyday = getschedulesbyday;
exports.getremove = getremove;
// Perhaps see if we can limit reading of schedules from file to only be when saving new schedule or removing old one. Not during runtime.