function post(req, res) {
	var variables = require('../templates/variables');
	var devicefunctions = require(variables.rootdir + 'functions/device');
	var classes = require(variables.rootdir + 'templates/classes');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	req.body.uniqueid = new Date().getTime();
	req.body.originaltime = req.body.time;
	req.body.stage = 0;

	var newschedule = new classes.schedule();

	for (var key in req.body) {
		newschedule[key] = req.body[key];
	}

	sharedfunctions.logToFile('Schedule,' + devicefunctions.getdeviceproperty(newschedule.deviceid, 'name') + ',Created,Created schedule: ' + JSON.stringify(newschedule), 'Device-' + newschedule.deviceid);
	variables.devices.forEach(function(device) {
		if (device.id == newschedule.deviceid) {
			device.schedule.push(newschedule);
		}
	});
	variables.savetofile = true;
	res.send('Schedule has been created.');
}

exports.post = post;