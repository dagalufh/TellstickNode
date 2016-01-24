function get(req, res) {
	// Include the template view (Do all the presentation(?))
	var variables = require('../templates/variables');
	// Include the functions for handling files
	var fs = require('fs');
	var template = require(variables.rootdir + 'templates/template-main').build;
	var devicefunctions = require(variables.rootdir + 'functions/device');
	// Save via socket.io call, this means we can toss back a reply that it's done. Or not needed.. res.send('Complete') will suffice.
	var headline = 'Changelog';
	var body = ['<div class="panel panel-default">',
		'<div class="panel-body">',
		'<div class="table-responsive">',
		'<table class="table table-bordered table-condensed" id="logtable">',
		'{log}',
		'</table>',
		'</div>',
		'</div>',
		'</div>'
	];

	body = body.join('\n');
	var logs = '';

	var data = fs.readFileSync(variables.rootdir + '/changelog.txt', {
		'encoding': 'utf8'
	});

	if (data.length > 1) {
		var rows = data.split('\n');
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].length === 0) {
				rows[i] = '&nbsp;';
			}
			if (rows[i].indexOf('Version : ') != -1) {
				logs += '<tr><th>' + rows[i] + "</th></tr>";
			} else {
				logs += '<tr><td class="text-info">' + rows[i] + "</td></tr>";
			}
		}
	}

	body = body.replace(/{log}/g, logs);

	res.send(template(headline, body, true));
}

exports.get = get;