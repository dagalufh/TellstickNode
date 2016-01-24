function post(req, res) {
  var variables = require('../templates/variables');
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
  // Include the functions for handling files
  var fs = require('fs');

  variables.options.city = req.body.city;
  variables.options.port = req.body.port;
  variables.options.openweatherappid = req.body.appid;
  variables.options.doubletapcount = req.body.doubletapcount;
  variables.options.doubletapseconds = req.body.doubletapseconds;
  variables.options.weathercodes = req.body.weathercodes;
  variables.options.autoremote_password = req.body.autoremote_password;
  variables.options.autoremote_key = req.body.autoremote_key;
  variables.options.autoremote_message = req.body.autoremote_message;
  variables.options.theme = req.body.theme;
  if (typeof(req.body.customlogs) == 'undefined') {
    variables.options.customlogs = []
  } else {
    variables.options.customlogs = req.body.customlogs;
  }

  var option = JSON.stringify(variables.options, null, 2);
  fs.writeFile(variables.rootdir + 'userdata/options.js', option, function(err) {
    if (err) throw err;
    sharedfunctions.logToFile('Options,Saved options.' + JSON.stringify(option), 'Core');
    res.send(true);
  });
}
exports.post = post;