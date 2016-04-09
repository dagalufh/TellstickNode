exports.get = get;

function get(req, res) {
	// Include the template view (Do all the presentation(?))
	var variables = require('../templates/variables');
	// Include the functions for handling files
	var fs = require('fs');
	var template = require(variables.rootdir + 'templates/template-main').build;

	// Save via socket.io call, this means we can toss back a reply that it's done. Or not needed.. res.send('Complete') will suffice.
	var headline = 'Customlogs';
	var body = ['<div class="panel panel-default">',
		'<div class="panel-heading">',
		'<h5 class="panel-title">Select Logfile</h5>',
		'</div>',
		'<div class="panel-body">',
		'<table class="table table-bordered table-condensed">',
		'<tr><td class="td-middle">Logfile:</td><td><select id="logtoview" class="input-sm">{logtoview}</select></td></tr>',
		'</table>',
		'</div>',
		'</div>',
		'<div class="panel panel-default">',
		'<div class="panel-body">',
		'<div class="table-responsive">',
		'<table class="table table-bordered table-condensed" id="logtable">',
		'{log}',
		'</table>',
		'</div>',
		'</div>',
		'</div>'
	];

	if (variables.options.customlogs.length === 0) {

		body = ['<div class="panel panel-default">',
			'<div class="panel-heading">',
			'<h5 class="panel-title">Custom Logfiles</h5>',
			'</div>',
			'<div class="panel-body">',
			'<p>You have not defined any custom logfiles to view, go to <a href="/options">Options</a> to configure that.</p>',
			'</div>',
			'</div>'
		];
	}

	body = body.join('\n');
	var logs = '';



	var logfilelist = [];
	var selected_file = '';

	if (typeof(req.query.logfile) != 'undefined') {
		selected_file = req.query.logfile;
	}

	var defaultlogfile = '';
	variables.options.customlogs.forEach(function(file) {


		var selected = '';
		if ((selected_file == file) || (selected_file.length === 0)) {
			selected = 'selected';
		}


		logfilelist.push('<option ' + selected + ' value="' + file + '">' + file);
		defaultlogfile = file;

		if (selected_file.length === 0) {
			selected_file = defaultlogfile;
		}
	});


	try {
		var data = fs.readFileSync(selected_file, {
			'encoding': 'utf8'
		});

		if (data.length > 1) {
			var rows = data.split('\n');
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].length === 0) {
					rows[i] = '&nbsp;';
				}
				rows[i] = rows[i].replace('\t', '<span style="padding-left:2em"></span>');
				logs += '<tr><td class="text-info">' + rows[i] + "</td></tr>";
			}
		}
	} catch (e) {
		logs = '<tr><td>Failed opening: ' + selected_file + '</td></tr>';
	}

	body = body.replace(/{log}/g, logs);
	body = body.replace(/{logtoview}/g, logfilelist.join('\n'));




	res.send(template(headline, body, true));
}