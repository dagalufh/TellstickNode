// The purpose of this file is to route the request to the correct file.
var saltedpasswords = require('./controllers/saltedpasswords.js').saltedpasswords;
var fs = require('fs');
var ip = require('ip');

var currentSession;
module.exports = function (app) {
    
   
    // Root page, or Home.
    app.route('/')
        .get(function (req, res) {
            if (checklogin(req, res)) {
                require('./controllers/home').get(req,res);
            }
        })
    
    // Display the loginpage
    app.route('/loginbox')
        .get(function (req, res) {
            
        })
    
    app.route('/login')
        .get(function (req, res) {
            require('./controllers/loginhandler').get(req,res);
        })
        .post(function (req, res) {
            require('./controllers/loginhandler').post(req,res);
        })
    
    app.route('/logout')
        .get(function(req,res) {
            req.session.destroy();
            res.redirect('/');
        })
      
    app.route('/logs')
        .get(function (req, res) {
            require('./controllers/logs').get(req,res);
        })
    
    app.route('/newschedule')
        .get(function(req,res) {
            if (checklogin(req, res)) {
            require('./controllers/newschedule').get(req,res);
            }
        })
        .post(function(req,res) {
            if (checklogin(req,res)) {
                require('./controllers/newschedule').post(req,res);
            }
        })
    app.route('/pauseschedules')
        .get(function(req,res) {
            if (checklogin(req, res)) {
                require('./controllers/schedulefunctions').getpauseschedules(req,res);
            }
        })
    app.route('/editschedule')
        .get(function(req,res) {
            if (checklogin(req, res)) {
            require('./controllers/editschedule').get(req,res);
            }
        })
        .post(function(req,res) {
            if (checklogin(req,res)) {
                require('./controllers/editschedule').post(req,res);
            }
        })
    
    app.route('/options')
        .get(function(req,res) {
            if (checklogin(req, res)) {
                require('./controllers/options').get(req,res);
            }
        })
        .post(function(req,res) {
            if (checklogin(req, res)) {
                require('./controllers/options').post(req,res);
            }
        })
    app.route('/device')
        .get(function(req,res) {
            //if (checklogin(req, res)) {
                require('./controllers/device').send(req,res);
            //}
        })
    
    app.route('/createuser')
        //.get(function (req,res) {
            //if (checklogin(req, res)) {
        //        require('./controllers/createuser').get(req,res);
            //}
        //})
        .post(function (req,res) {
            //if (checklogin(req, res)) {
                require('./controllers/createuser').post(req,res); 
            //}
        })
    app.route('/removeschedule')
        .get(function (req,res) {
            if (checklogin(req, res)) {
                require('./controllers/schedulefunctions').getremove(req,res);
            }
        }) 
    app.route('/remote')
        .get(function (req,res) {
            var remoteIP = req.connection.remoteAddress;
            if (req.connection.remoteAddress.indexOf('.') != -1) {
                remoteIP = req.connection.remoteAddress.substr(req.connection.remoteAddress.lastIndexOf(':')+1);
            }
            if (ip.isPrivate(remoteIP)) {
                require('./controllers/remote').get(req,res);
            } else {
                require('./controllers/forbidden').get(req,res);  
            }
        })
}

function checklogin(req, res) {
    //console.log("request received from: " + req.ip);
    currentSession = req.session;
    //console.log(ip.address());
    //console.log(req.connection.remoteAddress);
    var remoteIP = req.connection.remoteAddress;
    if (req.connection.remoteAddress.indexOf('.') != -1) {
        remoteIP = req.connection.remoteAddress.substr(req.connection.remoteAddress.lastIndexOf(':')+1);
    }
    
    if ( (currentSession.hash) && (currentSession.username) ) {
        
        if (saltedpasswords(currentSession.username + 'tellstick',8,currentSession.hash)) {
            return true;
        } else {
            fs.exists(__dirname + '/userdata/user.js', function (exists) {
                if (exists) {
                    require('./controllers/loginhandler').get(req,res);
                    return false;
                } else {
                    if (ip.isPrivate(remoteIP)) {
                        console.log('Initial launch. No user yet defined.');
                        require('./controllers/createuser').get(req,res);
                    } else {
                        require('./controllers/forbidden').get(req,res);
                    }
                    return false;
                }
            });
        }
    } else {
        fs.exists(__dirname + '/userdata/user.js', function (exists) {
                if (exists) {
                    require('./controllers/loginhandler').get(req,res);
                    return false;
                } else {
                    if (ip.isPrivate(remoteIP)) {
                        console.log('Initial launch. No user yet defined.');
                        require('./controllers/createuser').get(req,res);
                    } else {
                        require('./controllers/forbidden').get(req,res);
                    }
                    return false;
                }
            });
    }
}