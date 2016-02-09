// Include the template view (Do all the presentation(?))
var variables = require('../templates/variables');
var template = require(variables.rootdir + 'templates/template-main');
var saltedpasswords = require(variables.rootdir + 'functions/saltedpasswords.js').saltedpasswords;
var schedulefunctions = require(variables.rootdir + 'functions/schedulefunctions');
var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

// Define the get function that will return the content..?
function get(request, response) {

  // Define the different parts of the page.
  var headline = 'Remote';
  var body = ['<table class="table table-bordered">',
    '<tr><th>Status</th><th>Next Schedule</th><th>Device</th></tr>',
    '{available-devices}',
    '</table>'
  ];
  //'<div class="panel panel-default">','</div>'
  // Join each row of the body array to a continious string with proper row endings.
  body = body.join("\n");
  display_devices();

  // Define the function that enters devices into the device select box.
  // This function will be supplied to be used as a callback for when tdtool listing is done and fetching from 'database' is done.
  function display_devices() {
    var available_devices = '';
    var dayofweektranslate = {
      0: 'Sunday',
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday'
    };
    var sortedbyday = schedulefunctions.getschedulesbyday();
    variables.devices.forEach(function(device, index) {
      var status_on = '';
      var status_off = '';
      var status_dim = '';
      var dimbutton = '';

      var schedule = {
        time: '',
        action: ''
      };


      // -- Start of getting next schedule --

      var allschedules = [];
      var activeschedule = {
        uniqueid: ''
      };
      for (var key in sortedbyday) {
        if (sortedbyday.hasOwnProperty(key)) {
          var day = sortedbyday[key];
          if (day.length > 0) {
            day.sort(sharedfunctions.dynamicSortMultiple('time'));

            day.forEach(function(singleschedule) {
              if (singleschedule.enabled == 'true') {
                if (device.id == singleschedule.deviceid) {
                  allschedules.push(singleschedule);
                }
              }
            });
          }
        }
      }

      var activescheduleIndex = -1;
      var nextscheduleIndex = -1;
      for (var i = 0; i < allschedules.length; i++) {
        //console.log("allschedules[" + i + "]" + allschedules[i].uniqueid);
        if (allschedules[i].uniqueid == device.activescheduleid) {
          activescheduleIndex = i;
        }
      }

      if (activescheduleIndex != -1) {
        if (activescheduleIndex < allschedules.length) {
          nextscheduleIndex = activescheduleIndex + 1;
        }

        if (activescheduleIndex == (allschedules.length - 1)) {
          nextscheduleIndex = 0;
        }
      }

      if (nextscheduleIndex != -1) {
        schedule = allschedules[nextscheduleIndex];
      }

      // -- END of getting next schedule


      if (device.lastcommand.toLowerCase() == 'on') {
        status_on = 'btn-success';
      }
      if (device.lastcommand.toLowerCase() == 'off') {
        status_off = 'btn-success';
      }
      if (device.lastcommand.toLowerCase() == 'dim') {
        status_dim = 'btn-success';
      }

      if (variables.options.showdimoption == 'true') {
        dimbutton = '<button disabled class="btn btn-default ' + status_dim + '" id="commandbutton_' + device.id + '_dim" onClick="switchdevicestatus(\'' + device.id + '\',\'dim\');">DIM</button>';
      }
      available_devices += '<tr><td class="devicestatus"><button class="btn btn-default ' + status_on + '" id="commandbutton_' + device.id + '_on" onClick="switchdevicestatus(\'' + device.id + '\',\'on\');">ON</button><button class="btn btn-default ' + status_off + '" id="commandbutton_' + device.id + '_off" onClick="switchdevicestatus(\'' + device.id + '\',\'off\');">OFF</button>' + dimbutton + '</td><td class="devicestatus">' + schedule.time + ' ' + schedule.action + '</td><td>' + device.name + '</td></tr>';
    });

    // End of testing
    body = body.replace(/{available-devices}/g, available_devices);

    var loggedin = false;
    currentSession = request.session;
    if ((currentSession.hash) && (currentSession.username)) {
      if (saltedpasswords(currentSession.username + 'tellstick', 8, currentSession.hash)) {
        loggedin = true;
      }
    }
    response.send(template.build(headline, body, loggedin));
  }
}

exports.get = get;