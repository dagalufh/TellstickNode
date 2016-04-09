exports.post = post;

function post(req, res) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	
	var edit = true;
	if (typeof(req.body.deviceid) == 'undefined') {
		req.body.deviceid = variables.telldus.tdAddDevice();
		edit = false;
	}
	variables.telldus.tdSetDeviceParameter(req.body.deviceid,'devices',req.body.devices.join(','));
	variables.telldus.tdSetName(req.body.deviceid, req.body.name);
	variables.telldus.tdSetProtocol(req.body.deviceid,'group');
	

	if (edit === false) {
		sharedfunctions.logToFile('DeviceGroup,' + req.body.name + ',NULL,Created,Devicegroup has been created.', 'Device-' + req.body.deviceid);
		res.send({
			code: 'ok',
			message: 'Devicegroup has been created.'
		});
	} else {
		sharedfunctions.logToFile('DeviceGroup,' + req.body.name + ',NULL,Save,Devicegroup has been saved.', 'Device-' + req.body.deviceid);
		res.send({
			code: 'ok',
			message: 'Devicegroup has been changed and saved.'
		});
	}
}