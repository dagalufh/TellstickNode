// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main').build;
var classes = require('../model/classes');
var sharedfunctions = require('../model/sharedfunctions');


function get(req,res) {
    
    // Check if edit of schedule is requested. Try to use the same file?
    
    var selected_schedule = '';
    
    
    variables.devices.forEach(function (device) {
        device.schedule.forEach(function (schedule) {
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
                    '<div class="form-group">',
                                '<label for="Select_Controller">Controller</label>',
                                '<select id="Select_Controller" class="form-control">',
                                    '{selectcontroller}',
                                '</select>',
                                '<p class="text-info">{ControllerMessage}</p>',
                            '</div>',
                    '<div class="form-group">',
                                '<label for="Time">Time</label>',
                                '<input type="text" class="form-control" id="Time" placeholder="(HH:MM)24H" value="{initaltime}">',
                    '</div>',
                    '<div class="checkbox">',
                         '<label><input type="checkbox" id="runonce" Value="runonce" {runonce_selected}>Run Once - Remove after execution</label>',
                    '</div>',
                    '<div class="checkbox">',
                         '<label><input type="checkbox" id="autoremote" Value="autoremote" {autoremote_selected}>AutoRemote - Send message when triggered</label>',
                    '</div>',
                '</div>',
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
                    '<div class="panel-footer"><button class="btn btn-default" onClick="Javascript:createschedule('+selected_schedule.uniqueid+');">Save Edits</button></div>',
                '</div>'];
    body = body.join("\n");
    
    var device_options = '';
    var controllermessage = '';
    variables.devices.forEach(function(device, index) {
        var selected_device = '';
        if (device.id == selected_schedule.deviceid) {
            selected_device = 'selected';
        }
        device_options += '<option '+selected_device+' value="' + device.id + '">'+device.name + '\n';
    });

    body = body.replace(/{select_device}/g,device_options);
    
    body = body.replace(/{selectmodifierbeforecontroller}/g,createdropdown_alphanumeric([['None'],['Time','Specific Time'],['Sundown'],['Sunrise']],selected_schedule.intervalnotbeforecontroller));
    body = body.replace(/{selectmodifieraftercontroller}/g,createdropdown_alphanumeric([['None'],['Time','Specific Time'],['Sundown'],['Sunrise']],selected_schedule.intervalnotaftercontroller));
    body = body.replace(/{selectcontroller}/g,createdropdown_alphanumeric([['Time','Specific Time'],['Sundown'],['Sunrise'],['Timer']],selected_schedule.controller));
    
    if (typeof(variables.weather.sys) != 'undefined') {
       // body = body.replace(/{sunrise}/g,variables.weather.sys.sunrise);
        body = body.replace(/{ControllerMessage}/g,'');
    } else  {
        body = body.replace(/{Sunrise}/g,'disabled');
        controllermessage = controllermessage + 'Sunrise controller unavailable due to no weather information found.';
    }

    if (typeof(variables.weather.sys) != 'undefined') {
        //body = body.replace(/{sundown}/g,variables.weather.sys.sunset);
        body = body.replace(/{ControllerMessage}/g,'');
    } else  {
        body = body.replace(/{Sundown}/g,'disabled');
       controllermessage = controllermessage + '<br>Sundown controller unavailable due to no weather information found.';
    }
    
    body = body.replace(/{ControllerMessage}/g,controllermessage);
    
    body = body.replace(/{initaltime}/g, selected_schedule.originaltime); 
    body = body.replace(/{IntervalNotBeforeTime}/g, selected_schedule.intervalnotbefore); 
    body = body.replace(/{IntervalNotAfterTime}/g, selected_schedule.intervalnotafter); 
    
    body = body.replace(/{weathergoodtime}/g,createdropdown(90,10, selected_schedule.weathergoodtime));
    body = body.replace(/{weatherbadtime}/g,createdropdown(90,10, selected_schedule.weatherbadtime));
    body = body.replace(/{randomizertime}/g,createdropdown(40,5,selected_schedule.randomiser));
    
    body = body.replace(/{selectaction}/g,createdropdown_alphanumeric([['On'],['Off']],selected_schedule.action));
    
    body = body.replace(/{selectrandomizer}/g,createdropdown_alphanumeric([['+'],['-'],['both','+/-']],selected_schedule.randomizerfunction));
    body = body.replace(/{selectweathergood}/g,createdropdown_alphanumeric([['+'],['-']],selected_schedule.weathergoodfunction));
    body = body.replace(/{selectweatherbad}/g,createdropdown_alphanumeric([['+'],['-']],selected_schedule.weatherbadfunction));
    
    body = body.replace(/{selectenabled}/g,createdropdown_alphanumeric([['true','Yes'],['false','No']],selected_schedule.enabled));

    body = body.replace(/{notafter}/g,selected_schedule.intervalnotafter);
    body = body.replace(/{notbefore}/g,selected_schedule.intervalnotbefore);
    
    
    selected_schedule.dayofweek.forEach(function (day) {
        var searchstring  = new RegExp('id="DayOfWeek" Value="'+day+'"',"g");
        body = body.replace(searchstring,'id="DayOfWeek" Value="'+day+'" checked=checked');    
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
    
    body = body.replace(/{duration}/g, selected_schedule.duration); 
    
    res.send(template(headline,body,true));
}

function post(req,res) {
    var devicefunctions = require('../controllers/device');
    req.body.originaltime = req.body.time;
    req.body.stage = 0;

    var newschedule = new classes.schedule();

    for (var key in req.body) {
        newschedule[key] = req.body[key];  
    }
    
    variables.devices.forEach(function(device) {
        if (device.id == newschedule.deviceid) {
            device.schedule.forEach(function (schedule) {
                
                if (schedule.uniqueid == newschedule.uniqueid) {
                    for (var key in newschedule) {
                        schedule[key] = newschedule[key];  
                    }
                }   
            });
            //device.schedule.push(newschedule);
        }
    });
    variables.savetofile = true;
    sharedfunctions.logToFile('Schedule,'+ devicefunctions.getdeviceproperty(newschedule.deviceid,'name')+','+ newschedule.uniqueid+',Saved,Watcher was saved with this settings: ' + JSON.stringify(newschedule),'Device-'+newschedule.deviceid);
    res.send('Schedule has been saved.');
}

exports.get = get;
exports.post = post;


function createdropdown(max, intervall, selecteditem) {
    var dropdown = '<option value="0">0';
    for (var i = 1; i<=Math.floor(max/intervall); i++) {
        var selected = '';
        if (selecteditem == (i*intervall)) {
            selected = 'selected';
        }
        dropdown += '<option ' + selected + ' value="'+(i*intervall)+'">'+(i*intervall);

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
        
        dropdown += '<option {'+option[0]+'} ' + selected + ' value="'+option[0]+'">'+displayname;
    });
    return dropdown;
}