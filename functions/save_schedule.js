function post(req, res) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var devicefunctions = require(variables.rootdir + 'functions/device');
	req.body.originaltime = req.body.time;
	req.body.stage = 0;

	var newschedule = new classes.schedule();

	for (var key in req.body) {
		newschedule[key] = req.body[key];
	}

	variables.devices.forEach(function(device) {
		if (device.id == newschedule.deviceid) {
			device.schedule.forEach(function(schedule) {

				if (schedule.uniqueid == newschedule.uniqueid) {
					for (var key in newschedule) {
						schedule[key] = newschedule[key];
					}
				}
			});
		}
	});
	variables.savetofile = true;
	sharedfunctions.logToFile('Schedule,' + devicefunctions.getdeviceproperty(newschedule.deviceid, 'name') + ',' + newschedule.uniqueid + ',Saved,Watcher was saved with this settings: ' + JSON.stringify(newschedule), 'Device-' + newschedule.deviceid);
	res.send('Schedule has been saved.');
}

exports.post = post;