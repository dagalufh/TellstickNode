// Include the functions for handling files
var fs = require('fs');

// Include function for checking passwords
var saltedpasswords = require('./saltedpasswords.js').saltedpasswords;

// Include the template view (Do all the presentation(?))
var template = require('../views/template-main');

// Requests that come via GET is handled here.
function get(req,res) {
    
    // Return a header to the browser
    //res.status(200).send({'Content-Type':'text/html'});
    var headline = 'Create New User';
    var body = ['<form method="post" name="NewUserForm" enctype="application/x-www-form-urlencoded" action="/createuser">',
                    '<p class="text-info">No user detected. You have to create a new one to be able to proceed.</p>',
                    '<div class="form-group">',
                        '<label for="username">Username:</label>',
                        '<input type="text" class="form-control" name="username" placeholder="Username">',
                    '</div>',
                    '<div class="form-group">',
                        '<label for="password">Password:</label>',
                        '<input type="password" class="form-control" name="password" placeholder="Password">',
                    '</div>',                
                    '<input type="submit" value="Create User">',
                '</form>'];
    body = body.join("\n");
    
    var currentSession = req.session;
    if (currentSession.hash) {
        body = body + '[' + currentSession.hash + ']';   
    }
    
    res.send(template.build(headline,body));
    
};
var currentSession;
// Requests that come via POST is handled in this function
function post(req,res) {
    //res.send('Create a new user.');
    var postdata = req.body;
    currentSession = req.session;
    currentSession.hash = postdata.username;

    var headline = 'Create New User';
    var body = '<div id="Result">User created. <a href="/">Continue to login</a></div>';
    
    
    var password = saltedpasswords(postdata.password,postdata.password);
    
    //var arrayusers = [];
    // Create the user and store it to the user file
    var user = {"username":postdata.username,"password":password};
    
    //var user = {"username":postdata.username,"password":postdata.password};
    //arrayusers.push(user);
    
    var jsonuser = JSON.stringify(user,null,2);
    
    fs.writeFile(__dirname + '/../userdata/user.js',jsonuser, function(err) {
        if(err) throw err;
        console.log('User ' + user.username + ' has been created.');
    });
    
    
    
    res.send(template.build(headline,body));
};

exports.get = get;
exports.post = post;
exports.saltedpasswords = saltedpasswords;


function User() {
    this.username = '';
    this.passwqord = '';
}