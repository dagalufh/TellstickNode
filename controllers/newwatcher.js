// Include the template view (Do all the presentation(?))
var variables = require('../model/variables');
var template = require('../views/template-main').build;
var fs = require('fs');
var classes = require('../model/classes');
var sharedfunctions = require('../model/sharedfunctions');


function get(req,res) {

    var headline = 'New Watcher';
    var body = ['<div class="panel panel-default">',
                '<div class="panel-heading">',
                    'Watcher',
                '</div>',
                '<div class="panel-body">',
                    '<p class="bg-danger">Note that regular schedules will trigger a Watcher for a device! Don\'t mix unless you know what you are doing.</p>',
                    '<div class="form-group">',
                        '<label for="Select_Device">When device:</label>',
                        '<select id="Select_Device" class="form-control">',
                                '{select_device}',
                            '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Action">Changes state to:</label>',
                        '<select id="Select_Action" class="form-control">',
                                '<option value="On">On',
                                '<option value="Off">Off',
                            '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="WaitTime">Wait for: (Minutes)</label>',
                        '<input type="text" class="form-control" id="WaitTime" placeholder="Minutes" value="1">',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Action_After">Then set it to:</label>',
                        '<select id="Select_Action_After" class="form-control">',
                                '<option value="On">On',
                                '<option value="Off" selected>Off',
                            '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Enabled">Watcher enabled</label>',
                        '<select id="Select_Enabled" class="form-control">',
                            '{selectenabled}',
                        '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<div class="checkbox">',
                            '<label><input type="checkbox" id="autoremote" Value="autoremote">AutoRemote - Send message when created schedule is triggered</label>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="panel-footer"><button class="btn btn-default" onClick="Javascript:createwatcher();">Create Watcher</button></div>',
                '</div>'];
    body = body.join("\n");
    
    var device_options = '';
    var controllermessage = '';
    variables.devices.forEach(function(device, index) {
        if (device.type != 'group') {
            device_options += '<option value="' + device.id + '">'+device.name + '\n';
        }
    });

    body = body.replace(/{select_device}/g,device_options);
    body = body.replace(/{selectenabled}/g,createdropdown_alphanumeric([['true','Yes'],['false','No']],''));
    
    res.send(template(headline,body,true));
}

function post(req,res) {
    var devicefunctions = require('../controllers/device');
    var watcheralreadyfound = false;
    variables.devices.forEach(function (device) {
        device.watchers.forEach(function (watcher) {
            if (device.id == req.body.deviceid) {
                if (watcher.triggerstatus == req.body.triggerstatus) {
                    watcheralreadyfound = true;
                }
            }
        });
    });
    
    if (watcheralreadyfound === true) {
        res.send({code: 'error', message: 'Watcher was not created. There is already one for the selected trigger status.'});    
    } else {
        
        // Create the watcher.
        req.body.uniqueid = new Date().getTime();
        
        var newwatcher = new classes.watcher();

        for (var key in req.body) {
          newwatcher[key] = req.body[key];  
        }
        
        variables.devices.forEach(function(device) {
            if (device.id == newwatcher.deviceid) {
                device.watchers.push(newwatcher);
                sharedfunctions.log('Created watcher: ' + JSON.stringify(newwatcher));
            }
        });
        
        variables.savetofile = true;
        sharedfunctions.logToFile('Watcher,'+ devicefunctions.getdeviceproperty(newwatcher.deviceid,'name') +','+ newwatcher.uniqueid+',Created,Watcher has been created with these settings: ' + JSON.stringify(newwatcher),'Device-'+newwatcher.deviceid);
        res.send({code: 'ok', message: 'Watcher has been created.'});
    }
    
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
        
        dropdown += '<option {'+option[0]+'}' + selected + ' value="'+option[0]+'">'+displayname;
    });
    return dropdown;
}