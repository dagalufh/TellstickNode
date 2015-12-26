var variables = require('../model/variables');
var template = require('../views/template-main');
var sharedfunctions = require('../model/sharedfunctions');
var classes = require('../model/classes');

function removedevicegroup(req,res) {
    for (var i = 0; i < variables.devices.length; i++) {
       if (variables.devices[i].id == req.query.id) {           
           sharedfunctions.logToFile('DeviceGroup,'+ variables.devices[i].name +',NULL,REMOVED,Devicegroup was removed: ' + JSON.stringify(variables.devices[i]),'Device-'+variables.devices[i].id);
           variables.devices.splice(i,1);
       }
    }
    variables.savetofile = true;
    res.send(true);
}

function get(req,res) {
    var requestedgroup = '';
    var requestedid = '';
    var editname = '';
    var availabledevices = '';
    var includeddevices = '';
    
    if (typeof(req.query.id) != 'undefined') {
        variables.devices.forEach(function(device) {
           if (device.id == req.query.id) {
               requestedgroup = device;
           }
        });
        var headline = 'Edit Devicegroup';
        requestedid = requestedgroup.id;
        editname = requestedgroup.name;
        
        variables.devices.forEach( function (device) {
            if (device.type != 'group') {
                var devicefound = false;
                requestedgroup.devices.forEach( function(memberdeviceid) {
                    if (memberdeviceid == device.id) {
                        devicefound = true;
                    }   
                });
                
                if (devicefound) {
                    includeddevices += '<option value="' + device.id + '">'+ device.name;
                } else {
                    availabledevices += '<option value="' + device.id + '">'+ device.name;
                }
            }
        });
    } else {
        var headline = 'New Devicegroup';
        
        variables.devices.forEach( function (device) {
            if (device.type != 'group') {
                availabledevices += '<option value="' + device.id + '">'+ device.name;
            }
        });
    }
    
    var body = ['<div class="panel panel-default">',
                    '<div class="panel-heading">',
                        'Name',
                    '</div>',
                    '<div class="panel-body">',
                        '<div class="form-group">',
                            '<input type="text" id="devicegroupname" value="{editname}">',
                        '</div>',
                    '</div>',
                    '<div class="panel-heading">',
                        'Member Devices',
                    '</div>',
                    '<div class="panel-body">',
                            'Included Devices<br>',
                            '<select style="width: 200px;" id="includeddevices" size="10" multiple>{includeddevices}</select><br>',
                            '<button onClick="javascript:moveup()">&#x25B2;</button> <button onClick="javascript:movedown()">&#x25BC;</button><br>',
                            'Available Devices<br>',
                            '<select style="width: 200px;" id="availabledevices" size="10" multiple>{availabledevices}</select>',
                    '</div>',
                    '<div class="panel-footer"><button class="btn btn-default" onClick="Javascript:newdevicegroup(\'' + requestedid + '\');">Save Devicegroup</button></div>',
                '</div>'];
    
    body = body.join('\n');

    body = body.replace(/{editname}/g,editname);
    body = body.replace(/{availabledevices}/g,availabledevices);
    body = body.replace(/{includeddevices}/g,includeddevices);
    
    res.send(template.build(headline,body,true));
}

function post(req,res) {
    var edit = false;
    if (typeof(req.body.deviceid) == 'undefined') {
        req.body.deviceid = 'group' + new Date().getTime();
    }
    
    var newgroup = new classes.device();
    newgroup.id = req.body.deviceid;
    newgroup.devices = req.body.devices;
    newgroup.name = req.body.name;
    newgroup.type = 'group';
    newgroup.lastcommand = 'off';
 
    
    variables.devices.forEach( function (device) {
       if (device.id == newgroup.id) {
           // edit, device already exists. Update current.
           edit = true;
           device.name = newgroup.name;
           device.devices = newgroup.devices;
       }
           
    });
    variables.savetofile = true;
    if (edit === false) {
        variables.devices.push(newgroup);
        sharedfunctions.logToFile('DeviceGroup,'+ newgroup.name +',NULL,Created,Devicegroup has been created: ' + JSON.stringify(newgroup),'Device-'+newgroup.id);
        res.send({code: 'ok', message: 'Devicegroup has been created.'});
    } else {
        sharedfunctions.logToFile('DeviceGroup,'+ newgroup.name +',NULL,Save,Devicegroup has been saved: ' + JSON.stringify(newgroup),'Device-'+newgroup.id);
        res.send({code: 'ok', message: 'Devicegroup has been changed and saved.'});
    }
    
    
}

function showdevicegroup(req,res) {
    var requestedgroup = '';
    var devicelist = [];
    
    variables.devices.forEach(function(device) {
       if (device.id == req.query.id) {
           requestedgroup = device
       }
    });

    requestedgroup.devices.forEach( function (memberdeviceid) {
        variables.devices.forEach(function(device) {
           if (device.id == memberdeviceid) {
               devicelist.push(device.name);
           }
        });
    });
    
    devicelist = devicelist.join('<br>');
    var display = ['<table class="table table-bordered table-condensed">',
                   '<tr><td>DeviceID:</td><td>' + requestedgroup.id + '</td></tr>',
                '<tr><td>Name:</td><td>' + requestedgroup.name + '</td></tr>',
                '<tr><td>Devices:</td><td>' + devicelist + '</td></tr>',
                  '</table>'];
    
    res.send(display.join('\n'));
}

exports.post = post;
exports.get = get;
exports.removedevicegroup = removedevicegroup;
exports.showdevicegroup = showdevicegroup;