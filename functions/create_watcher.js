exports.post = post;

function post(req, res) {
	var variables = require('../templates/variables');
	var devicefunctions = require(variables.rootdir + 'functions/device');
	var classes = require(variables.rootdir + 'templates/classes');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

	var watcheralreadyfound = false;
	variables.devices.forEach(function(device) {
		device.watchers.forEach(function(watcher) {
			if (device.id == req.body.deviceid) {
				if (watcher.triggerstatus == req.body.triggerstatus) {
					watcheralreadyfound = true;
				}
			}
		});
	});

	if (watcheralreadyfound === true) {
		res.send({
			code: 'error',
			message: 'Watcher was not created. There is already one for the selected trigger status.'
		});
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
			}
		});

		variables.savetofile = true;
		sharedfunctions.logToFile('Watcher,' + devicefunctions.getdeviceproperty(newwatcher.deviceid, 'name') + ',' + newwatcher.uniqueid + ',Created,Watcher has been created with these settings: ' + JSON.stringify(newwatcher), 'Device-' + newwatcher.deviceid);
		res.send({
			code: 'ok',
			message: 'Watcher has been created.'
		});
	}

}