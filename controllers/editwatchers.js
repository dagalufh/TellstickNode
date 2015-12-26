var variables = require('../model/variables');
var sharedfunctions = require('../model/sharedfunctions');
var template = require('../views/template-main').build;
var classes = require('../model/classes');

// This function is for removing watchers from a device. It also forces a re-write to the files.
function removewatcher (req,res) {
    variables.devices.forEach( function(device) {
        for (var i = 0; i < device.watchers.length; i++) {
            
            if(req.query.watcherid == device.watchers[i].uniqueid) {
                sharedfunctions.logToFile('Watcher,'+ device.name+','+ device.watchers[i].uniqueid+',REMOVED,Schedule was removed. Info that was removed: ' + JSON.stringify(device.watchers[i]),'Device-'+device.watchers[i].deviceid);
                device.watchers.splice(i,1);
                i=0;
            }
        }   
    });
    variables.savetofile = true;
    res.send(true);
}


function get(req,res) {
    
    var selected_watcher = '';
    variables.devices.forEach(function (device) {
        device.watchers.forEach(function (watcher) {
            if (watcher.uniqueid == req.query.uniqueid) {
                selected_watcher = watcher;   
            }
        });
    });
    
    
    var headline = 'Edit Watcher';
    var body = ['<div class="panel panel-default">',
                '<div class="panel-heading">',
                    'Watcher',
                '</div>',
                '<div class="panel-body">',
                    '<p class="bg-danger">Note that regular schedules will trigger a Watcher for a device! Don\'t mix unless you know what you are doing.</p>',
                    '<div class="form-group">',
                        '<label for="Select_Device">When device:</label>',
                        '<select id="Select_Device" class="form-control" disabled>',
                                '{select_device}',
                        '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Action">Changes state to:</label>',
                        '<select id="Select_Action" class="form-control">',
                                '{selectactiontrigger}',
                        '</select>',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="WaitTime">Wait for: (Minutes)</label>',
                        '<input type="text" class="form-control" id="WaitTime" placeholder="Minutes" value="{waitminutes}">',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="Select_Action_After">Then set it to:</label>',
                        '<select id="Select_Action_After" class="form-control">',
                                '{selectactionafter}',
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
                            '<label><input type="checkbox" id="autoremote" Value="autoremote" {autoremote_selected}>AutoRemote - Send message when created schedule is triggered</label>',
                        '</div>',
                    '</div>',
                '</div>',
                '<div class="panel-footer"><button class="btn btn-default" onClick="Javascript:createwatcher('+selected_watcher.uniqueid+');">Save Changes</button></div>',
                '</div>'];
    body = body.join("\n");
    
    var device_options = '';
    var controllermessage = '';

    // Do all the calculations and work
    variables.devices.forEach(function(device, index) {
        var selected_device = '';
        if (device.id == selected_watcher.deviceid) {
            selected_device = 'selected';
        }
        device_options += '<option '+selected_device+' value="' + device.id + '">'+device.name + '\n';
    });
    

    // Update the body with the results of above calculations.
    body = body.replace(/{select_device}/g,device_options);
    body = body.replace(/{selectenabled}/g,sharedfunctions.createdropdown_alphanumeric([['true','Yes'],['false','No']],selected_watcher.enabled));
    body = body.replace(/{selectactiontrigger}/g,sharedfunctions.createdropdown_alphanumeric([['On'],['Off']],selected_watcher.triggerstatus));
    body = body.replace(/{selectactionafter}/g,sharedfunctions.createdropdown_alphanumeric([['On'],['Off']],selected_watcher.setstatus));
    body = body.replace(/{waitminutes}/g,selected_watcher.delay);
    
    if (selected_watcher.autoremoteonschedule == 'true') {
        body = body.replace(/{autoremote_selected}/g, 'checked=checked'); 
    } else {
        body = body.replace(/{autoremote_selected}/g, ''); 
    }
    
    res.send(template(headline,body,true));   
}

function post(req,res) {
    var devicefunctions = require('../controllers/device');
    var newwatcher = new classes.watcher();
    for (var key in req.body) {
        newwatcher[key] = req.body[key];  
    }
        
    
    variables.devices.forEach(function(device) {

        if (device.id == newwatcher.deviceid) {
            
            device.watchers.forEach(function (watcher) {
                
                if (watcher.uniqueid == newwatcher.uniqueid) {
                    
                    for (var key in newwatcher) {
                        watcher[key] = newwatcher[key];  
                    }
                }   
            });
        }
    });
    variables.savetofile = true;
    sharedfunctions.logToFile('Watcher,'+ devicefunctions.getdeviceproperty(newwatcher.deviceid,'name') +','+ newwatcher.uniqueid+',Saved,Watcher was saved with this settings: ' + JSON.stringify(newwatcher),'Device-'+newwatcher.deviceid);
    res.send('Watcher has been saved.');
}

exports.post = post;
exports.get = get;
exports.removewatcher = removewatcher;