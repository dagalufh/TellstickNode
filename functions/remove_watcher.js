// This function is for removing watchers from a device. It also forces a re-write to the files.
function get(req, res) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	variables.devices.forEach(function(device) {
		for (var i = 0; i < device.watchers.length; i++) {

			if (req.query.watcherid == device.watchers[i].uniqueid) {
				sharedfunctions.logToFile('Watcher,' + device.name + ',' + device.watchers[i].uniqueid + ',REMOVED,Schedule was removed. Info that was removed: ' + JSON.stringify(device.watchers[i]), 'Device-' + device.watchers[i].deviceid);
				device.watchers.splice(i, 1);
				i = 0;
			}
		}
	});
	variables.savetofile = true;
	res.send(true);
}
exports.get = get;