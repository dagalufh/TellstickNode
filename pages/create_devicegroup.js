function get(req, res) {
  var variables = require('../templates/variables');
  var template = require(variables.rootdir + 'templates/template-main');
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

  var requestedgroup = '';
  var requestedid = '';
  var editname = '';
  var availabledevices = '';
  var includeddevices = '';
  var headline = '';
  if (typeof(req.query.id) != 'undefined') {
    variables.devices.forEach(function(device) {
      if (device.id == req.query.id) {
        requestedgroup = device;
      }
    });
    headline = 'Edit Devicegroup';
    requestedid = requestedgroup.id;
    editname = requestedgroup.name;

    variables.devices.forEach(function(device) {
      if (device.type != 'group') {
        var devicefound = false;
        requestedgroup.devices.forEach(function(memberdeviceid) {
          if (memberdeviceid == device.id) {
            devicefound = true;
          }
        });

        if (devicefound) {
          includeddevices += '<option value="' + device.id + '">' + device.name;
        } else {
          availabledevices += '<option value="' + device.id + '">' + device.name;
        }
      }
    });
  } else {
    headline = 'New Devicegroup';

    variables.devices.forEach(function(device) {
      if (device.type != 'group') {
        availabledevices += '<option value="' + device.id + '">' + device.name;
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
    '</div>'
  ];

  body = body.join('\n');

  body = body.replace(/{editname}/g, editname);
  body = body.replace(/{availabledevices}/g, availabledevices);
  body = body.replace(/{includeddevices}/g, includeddevices);

  res.send(template.build(headline, body, true));
}
exports.get = get;