// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main').build;
var fs = require('fs');
var classes = require('../model/classes');
var sharedfunctions = require('../model/sharedfunctions');


function get(req,res) {

    // Need to create some sort of unique ID for each sechedule.
    var headline = 'New Schedule';
    var body = ['<div class="panel panel-default">',
                '<div class="panel-heading">',
                    'Device',
                '</div>',
                '<div class="panel-body">',
                     '<div class="form-group">',
                                '<select id="Select_Device" class="form-control">',
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
                                        '<option value="On">On',
                                        '<option value="Off">Off',
                                    '</select>',
                            '</div>',
                    '<div class="form-group">',
                                '<label for="Select_Controller">Controller</label>',
                                '<select id="Select_Controller" class="form-control">',
                                        '<option value="Time">Specific Time',
                                        '<option value="Sundown" title="Adjust to sundown time" {sundown}>Sundown',
                                        '<option value="Sunrise" title="Adjust to the time of sunrise" {sunrise}>Sunrise',
                                        '<option value="Timer">Timer',
                                    '</select>',
                                    '<p class="text-info">{ControllerMessage}</p>',
                            '</div>',
                    '<div class="form-group">',
                                '<label for="Time">Time</label>',
                                '<input type="text" class="form-control" id="Time" placeholder="(HH:MM)24H" value="{initaltime}">',
                    '</div>',
                    '<div class="checkbox">',
                         '<label><input type="checkbox" id="runonce" Value="runonce">Run Once - Remove after execution</label>',
                    '</div>',
                '</div>',
                '<div class="panel-heading">',
                    'Modifications',
                '</div>',
                '<div class="panel-body" id="Modificationsdiv">',
                    '<div class="form-group">',
                        '<label for="Select_Randomizer">Randomizer function</label>',
                        '<select id="Select_Randomizer" class="form-control">',
                            '<option value="+">+',
                            '<option value="-">-',
                            '<option value="both">+/-',
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
                            '<option value="+">+',
                            '<option value="-">-',
                        '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Weather_Good_Time">Weather Impact Minutes - Good Weather </label>',
                        '<select id="Select_Weather_Good_Time" class="form-control">',
                            '{weathertime}',
                        '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Weather_Bad">Weather Impact Function - Bad Weather</label>',
                        '<select id="Select_Weather_Bad" class="form-control">',
                            '<option value="+">+',
                            '<option value="-">-',
                        '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Weather_Bad_Time">Weather Impact Minutes - Bad Weather </label>',
                        '<select id="Select_Weather_Bad_Time" class="form-control">',
                            '{weathertime}',
                        '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="IntervalNotBeforeTime">Do not trigger if schedule trigger time is before:</label>',
                        '<input type="text" class="form-control" id="IntervalNotBeforeTime" placeholder="(HH:MM)24H" value="{notbeforetime}">',
                    '</div>',
                    '<div class="form-group">',
                            '<label for="IntervalNotAfterTime">Do not trigger if schedule trigger time is after:</label>',
                            '<input type="text" class="form-control" id="IntervalNotAfterTime" placeholder="(HH:MM)24H" value="{notaftertime}">',
                        '</div>',
                    '</div>',
                '<div class="panel-body" id="Timerdiv" style="display: none">',
                    '<div class="form-group">',
                                '<label for="Duration">Duration (Minutes)</label>',
                                '<input type="text" class="form-control" id="Duration" placeholder="Minutes" value="1">',
                    '</div>',
                '</div>',
                    '<div class="panel-footer"><button onClick="Javascript:createschedule();">Create Schedule</button></div>',
                '</div>'];
    body = body.join("\n");
    
    var device_options = '';
    var controllermessage = '';
    variables.devices.forEach(function(device, index) {
        device_options += '<option value="' + device.id + '">'+device.name + '\n';
    });

    body = body.replace(/{select_device}/g,device_options);
    
   
        if (typeof(variables.weather.sys) != 'undefined') {
            body = body.replace(/{sunrise}/g,variables.weather.sys.sunrise);
            body = body.replace(/{ControllerMessage}/g,'');
        } else  {
            body = body.replace(/{sunrise}/g,'disabled');
            controllermessage = controllermessage + 'Sunrise controller unavailable due to no weather information found.';
        }

        if (typeof(variables.weather.sys) != 'undefined') {
            body = body.replace(/{sundown}/g,variables.weather.sys.sunset);
            body = body.replace(/{ControllerMessage}/g,'');
        } else  {
            body = body.replace(/{sundown}/g,'disabled');
           controllermessage = controllermessage + '<br>Sundown controller unavailable due to no weather information found.';
        }
     body = body.replace(/{ControllerMessage}/g,controllermessage);
    
    var currentdate = new Date();
    var hour = '0' + currentdate.getHours();
    var minutes = '0' + currentdate.getMinutes();
    hour = hour.substr(hour.length-2);
    minutes = minutes.substr(minutes.length-2);
   
    
    body = body.replace(/{initaltime}/g, hour + ":" + minutes); 
    body = body.replace(/{weathertime}/g,createdropdown(90,10));
    body = body.replace(/{randomizertime}/g,createdropdown(40,5));
    body = body.replace(/{selectenabled}/g,createdropdown_alphanumeric([['true','Yes'],['false','No']],''));
    
    res.send(template(headline,body,true));
}

function post(req,res) {
    req.body.uniqueid = new Date().getTime();
    req.body.originaltime = req.body.time;
    req.body.stage = 0;
    //console.log(req.body);
    
    var newschedule = new classes.schedule();

    for (var key in req.body) {
      newschedule[key] = req.body[key];  
    }
    
    //console.log(newschedule);
    sharedfunctions.log('Created schedule: ' + JSON.stringify(newschedule));
    variables.devices.forEach(function(device) {
        //console.log('DeviceID : ' + device.id);
        if (device.id == newschedule.deviceid) {
            device.schedule.push(newschedule);
        }
    });
    variables.savetofile = true;
    res.send('Schedule has been created.');
}

exports.get = get;
exports.post = post;


function createdropdown(max, intervall) {
    var dropdown = '<option value="0">0';
    for (var i = 1; i<=Math.floor(max/intervall); i++) {
        dropdown += '<option value="'+(i*intervall)+'">'+(i*intervall);

    }
    return dropdown;
}

function createdropdown_alphanumeric(options,selecteditem) {
    // Generate dropdown options with the value and display from 'options[[value,displayname]]'
    // Displayname is optional as a second paremeter to the array. If not present, value will be displayed.
    var dropdown = '';
    options.forEach(function(option) {
        var selected = '';
        if (selecteditem.toLowerCase() == option[0].toLowerCase()) {
            selected = 'selected';
        }
        
        var displayname = option[0];
        if (typeof(option[1]) != 'undefined') {
            displayname = option[1];
        }
        
        dropdown += '<option ' + selected + ' value="'+option[0]+'">'+displayname;
    });
    return dropdown;
}