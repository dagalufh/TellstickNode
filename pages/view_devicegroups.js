function get(request, response) {
  var variables = require('../templates/variables');
  var template = require(variables.rootdir + 'templates/template-main');
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

  // Define the different parts of the page.
  var headline = 'View All Devicegroups';
  var body = ['<div class="panel panel-default">',
    '<div class="panel-heading">',
    '<h5 class="panel-title">Devicegroups</h5>',
    '</div>',
    '<div class="panel-body">',
    '<div class="table-responsive">',
    '<table id="ScheduledEvents_Body_Table" cellpadding="0" cellspacing="0" class="table table-bordered table-condensed">',
    '{Devicegroups}',
    '</table>',
    '</div>',
    '</div>',
    '</div>'
  ];

  // Join each row of the body array to a continious string with proper row endings.
  body = body.join("\n");

  var device_options = '';
  var devicegroups = '<tr><th>State</th><th>Name</th><th># of Devices</th><th></th></tr>';
  var devicetoview = '';
  var selected_deviceid = 0;
  var selected_scheduletype = '';
  var devicegroupsfound = false;

  if (typeof(request.query.deviceid) != 'undefined') {
    selected_deviceid = request.query.deviceid;
  }

  if (typeof(request.query.scheduletype) != 'undefined') {
    selected_scheduletype = request.query.scheduletype;
  }


  variables.devices.forEach(function(device) {
    var status_on = '';
    var status_off = '';

    if (device.lastcommand == 1) {
      status_on = 'btn-success';
    }
    if (device.lastcommand == 2) {
      status_off = 'btn-success';
    }

    if (device.type == 2) {
      devicegroupsfound = true;
      devicegroups += '<tr><td class="devicestatus" ><button class="btn btn-default ' + status_on + '" id="commandbutton_' + device.id + '_1" onClick="switchdevicestatus(\'' + device.id + '\',1);">ON</button><button class="btn btn-default ' + status_off + '" id="commandbutton_' + device.id + '_2" onClick="switchdevicestatus(\'' + device.id + '\',2);">OFF</button></td><td onclick="showdevicegroup(\'' + device.id + '\')">' + device.name + '</td><td>' + device.devices.length + '</td><td><a class="btn btn-default" href="/new_devicegroup?id=' + device.id + '">Edit</a><button class="btn btn-default" onclick="removedevicegroup(\'' + device.id + '\')">Remove</button></td></tr>';
    }

  });

  if (devicegroupsfound === false) {
    devicegroups = '<tr><td><p class="text-info">No devicegroups found.</p></td></tr>';
  }

  devicetoview = '<option value="0">All' + devicetoview;
  // End of testing
  body = body.replace(/{select_device}/g, device_options);
  body = body.replace(/{Devicegroups}/g, devicegroups);
  body = body.replace(/{devicetoview}/g, devicetoview);
  body = body.replace(/{schedulestoview}/g, sharedfunctions.createdropdown_alphanumeric([
    ['', 'Any'],
    ['true', 'Enabled'],
    ['false', 'Disabled']
  ], selected_scheduletype));
  var schedulestatus = 'Running normal';
  var schedulepauseclass = '';
  var pausebutton = 'Pause';
  if (variables.pauseschedules) {
    schedulestatus = 'Paused';
    schedulepauseclass = 'bg-danger';
    pausebutton = 'Resume';
  }
  body = body.replace(/{schedulestatus}/g, schedulestatus);
  body = body.replace(/{schedulepauseclass}/g, schedulepauseclass);
  body = body.replace(/{pausebutton}/g, pausebutton);

  response.send(template.build(headline, body, true));
}

exports.get = get;