function get(req, res) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	for (var i = 0; i < variables.devices.length; i++) {
		if (variables.devices[i].id == req.query.id) {
			sharedfunctions.logToFile('DeviceGroup,' + variables.devices[i].name + ',NULL,REMOVED,Devicegroup was removed: ' + JSON.stringify(variables.devices[i]), 'Device-' + variables.devices[i].id);
			variables.devices.splice(i, 1);
		}
	}
	variables.savetofile = true;
	res.send(true);
}

exports.get = get;