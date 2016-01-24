function post(req, res) {
	// Include function for checking passwords
	var variables = require('../templates/variables');
	var saltedpasswords = require(variables.rootdir + 'functions/saltedpasswords.js').saltedpasswords;
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var template = require(variables.rootdir + 'templates/template-main');
	//res.send('Create a new user.');
	var postdata = req.body;
	currentSession = req.session;
	currentSession.hash = postdata.username;

	var headline = 'Create New User';
	var body = '<div id="Result">User created. <a href="/">Continue to login</a></div>';


	var password = saltedpasswords(postdata.password, postdata.password);

	//var arrayusers = [];
	// Create the user and store it to the user file
	var user = {
		"username": postdata.username,
		"password": password
	};

	//var user = {"username":postdata.username,"password":postdata.password};
	//arrayusers.push(user);

	var jsonuser = JSON.stringify(user, null, 2);

	fs.writeFile(__dirname + '/../userdata/user.js', jsonuser, function(err) {
		if (err) throw err;
		sharedfunctions.logToFile('Login,User ' + user.username + ' has been created.', 'Core');
	});

	res.send(template.build(headline, body));
}
exports.post = post;