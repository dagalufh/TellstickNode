function get(req, res) {
	var variables = require('../templates/variables');
  var requestedgroup = '';
  var devicelist = [];

  variables.devices.forEach(function(device) {
    if (device.id == req.query.id) {
      requestedgroup = device;
    }
  });
	console.log(requestedgroup);
  requestedgroup.devices.forEach(function(memberdeviceid) {
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
    '</table>'
  ];

  res.send(display.join('\n'));
}
exports.get = get;