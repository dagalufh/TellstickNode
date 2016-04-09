function get(req, res) {
	var variables = require('../templates/variables');
	var deviceaction = require(variables.rootdir + 'functions/device');
	
	var requestedwatcher = '';
	var requesteddevice = '';
	var status = 'Enabled';
	var autoremote = 'No';
	var display = '';

	variables.devices.forEach(function(device) {
		device.watchers.forEach(function(schedule) {
			if (schedule.uniqueid == req.query.watcherid) {
				requestedwatcher = schedule;
				requesteddevice = device;
			}
		});
	});

	if (requestedwatcher.enabled == 'false') {
		status = 'Disabled';
	}

	if (requestedwatcher.sendautoremote == 'true') {
		autoremote = 'Yes';
	}
	
	var watcher_action_table = '';
  requestedwatcher.actions.forEach(function(action) {
      //watcher_actions += '<option value="' + action.id + ',' + action.status + ',' + action.delay + '">Change "'+deviceaction.getdeviceproperty(action.id,'name')+'" to "'+action.status+'" after '+action.delay + ' minutes';
      watcher_action_table += '<tr><td colspan="2">Change "' + deviceaction.getdeviceproperty(action.id, 'name') + '" to "' + variables.telldusstatus[action.status] + '" after ' + action.delay + ' minutes</td></tr>';
    });

	display = ['<table class="table table-bordered table-condensed">',
		'<tr><td>Watcherid:</td><td>' + requestedwatcher.uniqueid + '</td></tr>',
		'<tr><td>Status of Watcher:</td><td>' + status + '</td></tr>',
		'<tr><td>Monitoring Device:</td><td>' + requesteddevice.name + '</td></tr>',
		'<tr><td>Triggering Status:</td><td>' + variables.telldusstatus[requestedwatcher.triggerstatus] + '</td></tr>',
		'<tr><td>Configure created schedule to send autoremote:</td><td>' + autoremote + '</td></tr>',
		'<tr><td colspan="2">Actions:</td></tr>',
		watcher_action_table,
		
		'</table>'
	];

	res.send(display.join('\n'));
}

exports.get = get;