function post(req, res) {
	var variables = require('../templates/variables');
	var classes = require(variables.rootdir + 'templates/classes');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	
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

	variables.devices.forEach(function(device) {
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
		sharedfunctions.logToFile('DeviceGroup,' + newgroup.name + ',NULL,Created,Devicegroup has been created: ' + JSON.stringify(newgroup), 'Device-' + newgroup.id);
		res.send({
			code: 'ok',
			message: 'Devicegroup has been created.'
		});
	} else {
		sharedfunctions.logToFile('DeviceGroup,' + newgroup.name + ',NULL,Save,Devicegroup has been saved: ' + JSON.stringify(newgroup), 'Device-' + newgroup.id);
		res.send({
			code: 'ok',
			message: 'Devicegroup has been changed and saved.'
		});
	}

}
exports.post = post;