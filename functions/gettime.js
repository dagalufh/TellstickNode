function get(req,res) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var sunmovement = new Date(variables.weather.sys[req.query.controller] * 1000);
	
	res.send(sharedfunctions.gettwodigit(sunmovement.getHours()) + ":" + sharedfunctions.gettwodigit(sunmovement.getMinutes()));
}

exports.get = get;