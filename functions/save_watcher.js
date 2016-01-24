function post(req, res) {
	var variables = require('../templates/variables');
	var devicefunctions = require(variables.rootdir + 'functions/device');
	var classes = require(variables.rootdir + 'templates/classes');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	
	var newwatcher = new classes.watcher();
	for (var key in req.body) {
		newwatcher[key] = req.body[key];
	}

	variables.devices.forEach(function(device) {

		if (device.id == newwatcher.deviceid) {

			device.watchers.forEach(function(watcher) {

				if (watcher.uniqueid == newwatcher.uniqueid) {

					for (var key in newwatcher) {
						watcher[key] = newwatcher[key];
					}
				}
			});
		}
	});
	variables.savetofile = true;
	sharedfunctions.logToFile('Watcher,' + devicefunctions.getdeviceproperty(newwatcher.deviceid, 'name') + ',' + newwatcher.uniqueid + ',Saved,Watcher was saved with this settings: ' + JSON.stringify(newwatcher), 'Device-' + newwatcher.deviceid);
	res.send('Watcher has been saved.');
}

exports.post = post;