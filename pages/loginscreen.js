function get(req, res) {
	var template = require('../templates/template-main').build;
	var body = ['<div id="LoginDiv">',
		'<form method="post" onsubmit="javascript:attemptlogin();return false;" name="LoginForm" enctype="application/x-www-form-urlencoded">',
		'<div class="form-group">',
		'<label for="username">Username</label>',
		'<input type="text" class="form-control input-sm" id="username" placeholder="Username">',
		'</div>',
		'<div class="form-group">',
		'<label for="password">Password</label>',
		'<input type="password" class="form-control input-sm" id="password" placeholder="Password">',
		'</div>',
		'<input class="btn btn-default btn-sm" type="submit" value="Login">',
		'</form>',
		'</div>'
	];
	body = body.join('\n');

	res.send(template('Login', body, false));
}
exports.get = get;