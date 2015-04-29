// Include the functions for handling files
var fs = require('fs');
var saltedpasswords = require('./saltedpasswords.js').saltedpasswords;

// Include the template view (Do all the presentation(?))
var template = require('../views/template-main').build;

function get(req,res) {
    var body = ['<div id="LoginDiv">',
                    '<form method="post" onsubmit="javascript:attemptlogin();return false;" name="LoginForm" enctype="application/x-www-form-urlencoded">',
                        '<div class="form-group">',
                            '<label for="username">Username</label>',
                            '<input type="text" class="form-control" id="username" placeholder="Username">',
                        '</div>',
                        '<div class="form-group">',
                            '<label for="password">Password</label>',
                            '<input type="password" class="form-control" id="password" placeholder="Password">',
                        '</div>',
                        '<input type="submit" value="Login">',
                    '</form>',
               '</div>'];
    body = body.join('\n');
    
    res.send(template('Login',body,false));
}

function post(req,res) {
    var Users;
    var currentSession;
    fs.readFile(__dirname + '/../userdata/user.js',{'encoding':'utf8'},function(err,data) {
        if (err) throw err;
        Users = JSON.parse(data);
       
        if ( (Users.username == req.body.username) && (saltedpasswords(req.body.password, req.body.password ,Users.password)) ) {
            var date = new Date();
            currentSession = req.session;
            currentSession.lastactive = date.getTime();
            currentSession.username = Users.username;
            currentSession.hash = saltedpasswords(Users.username + 'tellstick',8);
            
            //saltedpasswords(Users.password,Users.password, req.body.password);
            res.send('true');
        } else {
            res.send('false');
        }
    });    
    
    
}

exports.get = get;
exports.post = post;