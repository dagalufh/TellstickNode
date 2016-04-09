function get(req, res) {
	var variables = require('../templates/variables');
	
	variables.telldus.tdRemoveDevice(req.query.id);
	res.send(true);
}

exports.get = get;