// The purpose of this file is to route the request to the correct file.
var fs = require('fs');
var ip = require('ip');
var variables = require('../templates/variables');
var saltedpasswords = require(variables.rootdir + 'functions/saltedpasswords.js').saltedpasswords;
var currentSession;
module.exports = function(app) {

  /* ***** MAIN PAGES ***** */
  // Root page, or Home.
  app.route('/')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/home').get(req, res);
      }
    })
  app.route('/options')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/options').get(req, res);
      }
    })
    .post(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/save_options').post(req, res);
      }
    })
  app.route('/remote')
    .get(function(req, res) {
      var remoteIP = req.connection.remoteAddress;
      if (req.connection.remoteAddress.indexOf('.') != -1) {
        remoteIP = req.connection.remoteAddress.substr(req.connection.remoteAddress.lastIndexOf(':') + 1);
      }
      console.log('IP Trygin to access REMOTE: ' + remoteIP)
      if (ip.isPrivate(remoteIP)) {
        require(variables.rootdir + 'pages/remote').get(req, res);
      } else {
        require(variables.rootdir + 'pages/forbidden').get(req, res);
      }
    })
  app.route('/restart')
    .get(function(req, res) {
      require(variables.rootdir + 'pages/restart').get(req, res);
    })


  /* ***** USER MANAGEMENT ***** */
  app.route('/createuser')
    .post(function(req, res) {
      //if (checklogin(req, res)) {
      require(variables.rootdir + 'functions/save_user').post(req, res);
      //}
    })
  app.route('/login')
    .get(function(req, res) {
      require(variables.rootdir + 'pages/loginscreen').get(req, res);
    })
    .post(function(req, res) {
      require(variables.rootdir + 'functions/loginhandler').post(req, res);
    })

  app.route('/logout')
    .get(function(req, res) {
      req.session.destroy();
      res.redirect('/');
    })


  /* ***** SCHEDULE PAGES AND FUNCTIONS ***** */
  app.route('/newschedule')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/create_schedule').get(req, res);
      }
    })
    .post(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/create_schedule').post(req, res);
      }
    })
  
  app.route('/pauseschedules')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/schedulefunctions').getpauseschedules(req, res);
      }
    })
  app.route('/resetschedules')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/device').getresetdevices(req, res);
      }
    })
  app.route('/editschedule')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/editschedule').get(req, res);
      }
    })
    .post(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/save_schedule').post(req, res);
      }
    })
  app.route('/removeschedule')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/schedulefunctions').getremove(req, res);
      }
    })
  app.route('/view_schedules')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/view_schedules').get(req, res);
      }
    })
  app.route('/showscheduleinfo')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/schedulefunctions').getschedule(req, res);
      }
    })
  app.route('/gettime')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/gettime').get(req, res);
      }
    })
  /* ***** WATCHER PAGES AND FUNCTIONS ***** */
  app.route('/newwatcher')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/create_watcher').get(req, res);
      }
    })
    .post(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/create_watcher').post(req, res);
      }
    })
  app.route('/editwatcher')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/editwatchers').get(req, res);
      }
    })
    .post(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/save_watcher').post(req, res);
      }
    })
  app.route('/removewatcher')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/remove_watcher').get(req, res);
      }
    })
  app.route('/view_watchers')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/view_watchers').get(req, res);
      }
    })
  app.route('/showwatcherinfo')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/show_watcher').get(req, res);
      }
    })


  /* ***** DEVICE MANAGEMENT ***** */
  app.route('/device')
    .get(function(req, res) {
      var remoteIP = req.connection.remoteAddress;
      if (req.connection.remoteAddress.indexOf('.') != -1) {
        remoteIP = req.connection.remoteAddress.substr(req.connection.remoteAddress.lastIndexOf(':') + 1);
      }
             
      if ( (checklogin(req, res)) || (ip.isPrivate(remoteIP)) ) {
        require(variables.rootdir + 'functions/device').send(req, res);
      }
    })


  /* ***** DEVICEGROUP PAGES AND FUNCTIONS ***** */
  app.route('/new_devicegroup')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/create_devicegroup').get(req, res);
      }
    })
    .post(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/save_devicegroup').post(req, res);
      }
    })
  app.route('/remove_devicegroup')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/remove_devicegroup').get(req, res);
      }
    })
  app.route('/showdevicegroup')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/return_devicegroup').get(req, res);
      }
    })
  app.route('/view_devicegroups')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/view_devicegroups').get(req, res);
      }
    })


  /* ***** BACKUP PAGES AND FUNCTIONS ***** */
  app.route('/view_restorebackup')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/view_updatebackup').get(req, res);
      }
    })
  app.route('/restore-backup')
    .post(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/restorebackup').restore(req, res);
      }
    })
  /* ***** LOGS SECTION ***** */
  app.route('/logs')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/view_logs').get(req, res);
      }
    })
  app.route('/custom_logs')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/view_customlog').get(req, res);
      }
    })
  app.route('/changelog')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'pages/view_changelog').get(req, res);
      }
    })

  /* ***** UPDATE PAGES AND FUNCTIONS ***** */
  app.route('/updates-check')
    .get(function(req, res) {
      if (checklogin(req, res)) {
        require(variables.rootdir + 'functions/check_updates').check_updates(variables.currentversion, null, req, res);
      }
    })

  // If the request dosn't match anything, return a 404.
  app.get('*', function(req, res) {
    require(variables.rootdir + 'pages/404').get(req, res);
  });
}

function checklogin(req, res) {
  currentSession = req.session;
  var remoteIP = req.connection.remoteAddress;
  if (req.connection.remoteAddress.indexOf('.') != -1) {
    remoteIP = req.connection.remoteAddress.substr(req.connection.remoteAddress.lastIndexOf(':') + 1);
  }

  if ((currentSession.hash) && (currentSession.username)) {

    if (saltedpasswords(currentSession.username + 'tellstick', 8, currentSession.hash)) {
      return true;
    } else {
      fs.exists(variables.rootdir + 'userdata/user.js', function(exists) {
        if (exists) {
          require(variables.rootdir + 'pages/loginscreen').get(req, res);
          return false;
        } else {
          if (ip.isPrivate(remoteIP)) {
            sharedfunctions.logToFile('Login,Initial Launch, no previous user defined.', 'Core');
            require(variables.rootdir + 'pages/createuser').get(req, res);
          } else {
            require(variables.rootdir + 'pages/forbidden').get(req, res);
          }
          return false;
        }
      });
    }
  } else {
    fs.exists(variables.rootdir + '/userdata/user.js', function(exists) {
      if (exists) {
        require(variables.rootdir + 'pages/loginscreen').get(req, res);
        return false;
      } else {
        if (ip.isPrivate(remoteIP)) {
          sharedfunctions.logToFile('Login,Initial Launch, no previous user defined.', 'Core');
          require(variables.rootdir + 'pages/createuser').get(req, res);
        } else {
          require(variables.rootdir + 'pages/forbidden').get(req, res);
        }
        return false;
      }
    });
  }
}