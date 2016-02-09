process.chdir(__dirname);

if (process.argv[2] == '--dev') {
	console.log('################ Running in DEV Mode ################')
}
var os = require('os');
var variables = require('./templates/variables');

// Define the root directory path to be able to use it later easily.
if (os.platform() === 'win32') {
	variables.rootdir = __dirname.replace(/\\/g, "/") + '/'
} else if (os.platform() == 'linux') {
	variables.rootdir = __dirname + '/'
}

var fs = require('fs');
var async = require('async');
var exec = require('child_process').exec;
var classes = require('./templates/classes');
var express = require('express');
var session = require('express-session');
var io = require('socket.io')(app);
var devicefunctions = require('./functions/device');
var schedulefunctions = require('./functions/schedulefunctions');
var app = express();

var http = require('http');
var compareversion = require('compare-version');

var sharedfunctions = require('./functions/sharedfunctions');

sharedfunctions.logToFile('Bootprocess,####################################', 'Core');
sharedfunctions.logToFile('Bootprocess,Bootprocess Started.', 'Core');

var lasttimestamp_recalculate = new Date();

try {
	sharedfunctions.logToFile('Bootprocess,Using Knex for session storage.', 'Core');
	var KnexSessionStore = require('connect-session-knex')(session);
	var dbstore = new KnexSessionStore();
	// Use the sessionhandler from express-session 60 * 60 * 1000
	app.use(session({
		secret: 'thisisasecret',
		cookie: {
			maxAge: (1000 * 60) * 120
		},
		resave: true,
		saveUninitialized: false,
		store: dbstore
	}));
} catch (e) {
	sharedfunctions.logToFile('Bootprocess,Using session-file-store for session storage.', 'Core');
	var filestorage = require('session-file-store')(session);
	// Use the sessionhandler from express-session 60 * 60 * 1000
	app.use(session({
		secret: 'thisisasecret',
		cookie: {
			maxAge: (1000 * 60) * 120
		},
		resave: true,
		saveUninitialized: false,
		store: new filestorage()
	}));
}

// Require a parser for handling POST requests and use it.
var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({
	extended: true
}));

// Define a folder containing the static files. This is the css files or client side js files
app.use(express.static(__dirname + '/assets'));

// Include the function that handles routing.
require('./functions/router.js')(app);

async.series([
	function(callback) {
		fs.exists(__dirname + '/userdata', function(exists) {
			if (!exists) {
				fs.mkdir(__dirname + '/userdata', function() {
					sharedfunctions.logToFile('Bootprocess,Created a userdata folder in TellstickNode root.', 'Core');
					callback();
				});
			} else {
				sharedfunctions.logToFile('Bootprocess,Using already existing userdata folder in TellstickNode root.', 'Core');
				callback();
			}
		});
	},
	function(callback) {
		// Check if the optionsfile already exists or not. otherwise, create it.
		fs.exists(__dirname + '/userdata/options.js', function(exists) {
			var optionsobject = {};

			if (!exists) {
				// Define default options

				var optionsjson = JSON.stringify(variables.options, null, 2);
				fs.writeFile(__dirname + '/userdata/options.js', optionsjson, function(err) {
					// Write the default options to the file.
					if (err) return callback(err);
					sharedfunctions.logToFile('Bootprocess,Created a default options.js file since there was none before.', 'Core');
					callback();
				});
			} else {
				sharedfunctions.logToFile('Bootprocess,Using existing options.js file in userdata.', 'Core');
				callback();
			}
		});

	},
	function(callback) {
		sharedfunctions.logToFile('Bootprocess,Loading deviceinformation', 'Core');
		devicefunctions.getdevicestatus(false, callback);
	},
	function(callback) {
		// CALL LOAD USERDATA    
		sharedfunctions.logToFile('Bootprocess,Loading userdata', 'Core');
		var load_userdata = require('./functions/load_userdata');
		load_userdata(callback);
	},
	function(callback) {
		// Fetch weather information
		sharedfunctions.logToFile('Bootprocess,Loading weatherdata', 'Core');
		require('./functions/check_weather').check_weather(callback);
	},
	function(callback) {
		sharedfunctions.logToFile('Bootprocess,Running highlighting of active schedule', 'Core');
		var highlight = schedulefunctions.highlightactiveschedule;
		highlight(callback);
	},
	function(callback) {
		// Reset devices to correct status
		sharedfunctions.logToFile('Bootprocess,Resetting devices to their correct status.', 'Core');
		devicefunctions.resetdevices(callback);
	}
], function(err) {
	// Start the server here
	variables.savetofile = true;
	var server = app.listen(variables.options.port, function() {
		var host = server.address().address
		var port = server.address().port
		sharedfunctions.logToFile('Bootprocess,Bootprocess Complete. TellstickNode is now listening on http://' + host + ':' + port, 'Core');
	});

	io.listen(server);

	io.sockets.on('connection', function(socket) {
		socket.on('request_sun_time', function(data) {
			var sunmovement = new Date(variables.weather.sys[data.controller] * 1000);
			sendtoclient([{
				device: 'Time:' + gettwodigit(sunmovement.getHours()) + ":" + gettwodigit(sunmovement.getMinutes())
			}]);
		});
	});


	var timerstart = new Date();
	setTimeout(devicefunctions.getdevicestatus, 1000 * variables.refreshdevicestatustimer);
	setTimeout(devicefunctions.doubletapcheck, 1000 * variables.options.doubletapseconds);
	setTimeout(minutecheck, 60000, timerstart);
});

// Implement locking device to not let this do anything if a restore is in progress.
function minutecheck(timestamp_start) {
	sharedfunctions.DateAdd('n', timestamp_start, 1);
	var timestamp_end, hour, minutes, seconds, enddifference;

	if (variables.restoreInProgress === true) {
		timestamp_end = new Date();
		enddifference = timestamp_end - timestamp_start;
		timestamp_end.setMilliseconds(timestamp_end.getMilliseconds() - enddifference);
		setTimeout(minutecheck, (60000 - enddifference), timestamp_end);
		return;
	}

	hour = gettwodigit(timestamp_start.getHours());
	minutes = gettwodigit(timestamp_start.getMinutes());

	var dayofweek = timestamp_start.getUTCDay();
	var removeschedules = [];

	variables.schedulesbyday[timestamp_start.getUTCDay()].forEach(function(criteria) { // Criteria BEGIN

			var schedule = schedulefunctions.getscheduleproperty(criteria.uniqueid, '*');
			var device = devicefunctions.getdeviceproperty(criteria.deviceid, '*');
			if (criteria.time == hour + ':' + minutes) {

				if (variables.pauseschedules) {
					sharedfunctions.logToFile('Schedule,' + device.name + ',' + schedule.uniqueid + ',PAUSED,Schedule was supposed to trigger. But has not since all schedules are paused by user.', 'Device-' + schedule.deviceid);
				} else {
					if (schedule.enabled == 'true') {
						var runschedule = true;

						if (schedule.intervalnotbefore.indexOf(':') != -1) {
							var notbefore = new Date();
							var notbeforearray = schedule.intervalnotbefore.split(':');
							notbefore.setHours(notbeforearray[0]);
							notbefore.setMinutes(notbeforearray[1]);
							var minutedifference_notbefore = Math.floor(((timestamp_start - notbefore) / 1000) / 60);
							if (minutedifference_notbefore < 0) {
								// if less than 0, don't run the schedule! // This means that the before time has not yet been reached.
								runschedule = false;
							}
						}

						if (schedule.intervalnotafter.indexOf(':') != -1) {
							var notafter = new Date();
							var notafterearray = schedule.intervalnotafter.split(':');
							notafter.setHours(notafterearray[0]);
							notafter.setMinutes(notafterearray[1]);
							var minutedifference_notafter = Math.floor(((timestamp_start - notafter) / 1000) / 60);
							if (minutedifference_notafter > 0) {
								// if more than 0, don't run the schedule! | This means that the after time has already passes.
								runschedule = false;
							}
						}

						if (runschedule) {
							sharedfunctions.logToFile('Schedule,' + device.name + ',' + schedule.uniqueid + ',Trigger,Schedule has been triggered. Sending command ' + schedule.action, 'Device-' + schedule.deviceid);
							devicefunctions.deviceaction(device.id, schedule.action, 'Schedule');

							if (schedule.sendautoremote == 'true') {
								sharedfunctions.autoremote(device.name, schedule.action);
							}
							if ((schedule.runonce == 'true') && (schedule.criterias[criteria.criteriaid].controller != 'Timer')) {
								removeschedules.push(schedule.uniqueid);
							}
							sendtoclient([{
								device: device.id + ':' + schedule.uniqueid
							}])
							schedule.stage = 1;
							// Check if doubletap is configured. If so, add this schedule to the doubletap array with a counter
							if (variables.options.doubletapcount > 0) {
								variables.doubletap.push({
									schedule: schedule,
									count: variables.options.doubletapcount,
									action: schedule.action
								});
							}
						} else {
							sharedfunctions.logToFile('Schedule,' + device.name + ',' + schedule.uniqueid + ',Trigger,Schedule was out of allowed interval. Not triggered. Allowed interval was: ' + schedule.intervalnotbefore + ' - ' + schedule.intervalnotafter, 'Device-' + schedule.deviceid);
						}
					} else {
						sharedfunctions.logToFile('Schedule,' + device.name + ',' + schedule.uniqueid + ',Trigger,Schedule did not trigger because it was disabled.', 'Device-' + schedule.deviceid);
					}
				}
			}
			
			
			if ( (typeof(schedule) != 'undefined') && (schedule.criterias[criteria.criteriaid].controller == 'Timer') ) {
				// Not yet tested. newschedule are not sorted for this yet.
				var timerdate = new Date();

				var timearray = schedule.criterias[criteria.criteriaid].time.split(':');
				timerdate.setHours(timearray[0]);
				timerdate.setMinutes(timearray[1]);
				//console.log(timerdate);
				sharedfunctions.DateAdd('n', timerdate, Number(schedule.duration));

				var timertime = gettwodigit(timerdate.getHours()) + ":" + gettwodigit(timerdate.getMinutes());

				//console.log('id ' + schedule.uniqueid + ' [' + schedule.time + " ] " + timertime  +' == '+ hour + ':' + minutes + ' and schedule.stage == ' + schedule.stage);
				if ((timertime == hour + ':' + minutes) && (schedule.stage == 1)) {
					if (variables.pauseschedules) {
						sharedfunctions.logToFile('Schedule,' + device.name + ',' + schedule.uniqueid + ',PAUSED,Timer OFF event did not trigger because schedules are paused.', 'Device-' + schedule.deviceid);
					} else {
						sharedfunctions.logToFile('Schedule,' + device.name + ',' + schedule.uniqueid + ',Trigger,Timer OFF event sent to device.', 'Device-' + schedule.deviceid);
						devicefunctions.deviceaction(device.id, 'off', 'Timer');

						if (schedule.sendautoremote == 'true') {
							sharedfunctions.autoremote(device.name, 'off');
						}

						schedule.stage = 2;
						if (schedule.runonce == 'true') {
							removeschedules.push(schedule.uniqueid);
						}
						sendtoclient([{
							device: device.id + ':' + schedule.uniqueid
						}])

						// Check if doubletap is configured. If so, add this schedule to the doubletap array with a counter
						if (variables.options.doubletapcount > 0) {
							variables.doubletap.push({
								schedule: schedule,
								count: variables.options.doubletapcount,
								action: 'off'
							});
						}
					}
				}
			}
		}) // Criteria END

	// Remove any runonce schedules that has been executed
	//schedulefunctions.removeschedule(removeschedules); 
	variables.devices.forEach(function(device) {
		for (var i = 0; i < device.schedule.length; i++) {
			removeschedules.forEach(function(scheduletoremove) {
				//console.log(scheduletoremove + "==" + device.schedule[i].uniqueid);
				if (scheduletoremove == device.schedule[i].uniqueid) {
					variables.savetofile = true;
					sharedfunctions.logToFile('Schedule,' + device.name + ',' + device.schedule[i].uniqueid + ',REMOVED,Runonce schedule was removed. Info that was removed: ' + JSON.stringify(device.schedule[i]), 'Device-' + device.schedule[i].deviceid);
					device.schedule.splice(i, 1);
					i = 0;
				}
			});
		}

	});
	
	variables.schedulesbyday.forEach(function(day) {
    for (var i = 0; i < day.length; i++) {
      removeschedules.forEach(function(scheduletoremove) {
        if (scheduletoremove == day[i].uniqueid) {
          sharedfunctions.logToFile('Schedule,' + devicefunctions.getdeviceproperty(day[i].deviceid,'name') + ',' + day[i].uniqueid + ',REMOVED,Schedule was removed. Info that was removed: ' + JSON.stringify(day[i]), 'Device-' + day[i].deviceid);
          day.splice(i, 1);
          i = 0;
        }
      });
    }

  });

	if (variables.savetofile) {

		// Backup function for userdata. Keep 7 copies.
		var fs = require('fs');
		var fsextra = require('fs-extra');

		var rootbackupdir = __dirname + '/backup/auto/';
		// Create the directory if it dosn't exist.
		fsextra.mkdirsSync(rootbackupdir);

		var backupfoldercontents = fs.readdirSync(rootbackupdir);
		var currentdate = new Date();
		var year = currentdate.getFullYear();
		var month = gettwodigit((currentdate.getMonth() + 1));
		var day = gettwodigit(currentdate.getDate());

		// Sort the directory of backups so we don't remove anything we shoudln't.
		backupfoldercontents.sort(function(a, b) {
			return a < b ? -1 : 1;
		})

		if (backupfoldercontents.indexOf(year.toString() + month.toString() + day.toString()) != -1) {
			sharedfunctions.logToFile('Backup,Backup has already been done today.', 'Core');
		} else {
			sharedfunctions.logToFile('Backup,Starting backup process.', 'Core');

			while (backupfoldercontents.length > 6) {
				var oldest = backupfoldercontents.shift();
				var userdata = fs.readdirSync(rootbackupdir + oldest);
				userdata.forEach(function(filename) {
					fs.unlinkSync(rootbackupdir + oldest + '/' + filename);
				});
				fs.rmdirSync(rootbackupdir + oldest);
				sharedfunctions.logToFile('Backup,Removed old backup: ' + oldest, 'Core');
			}

			sharedfunctions.logToFile('Backup,Available Backups:', 'Core');
			backupfoldercontents.forEach(function(file, key) {
				sharedfunctions.logToFile('Backup,' + file, 'Core');
			});
			sharedfunctions.logToFile('Backup,Creating todays backupfolder: ' + rootbackupdir + year.toString() + month.toString() + day.toString(), 'Core');
			fs.mkdirSync(rootbackupdir + year.toString() + month.toString() + day.toString());
			var userdatadir = fs.readdirSync(__dirname + '/userdata');
			userdatadir.forEach(function(filename) {
				sharedfunctions.logToFile('Backup,Creating a backup of ' + filename, 'Core');
				fsextra.copySync(__dirname + '/userdata/' + filename, rootbackupdir + year + month + day + '/' + filename);
			});
		}

		var sourcefolder = __dirname.replace("\\", "/");
		var device_schedules = '';
		var device_watchers = '';
		var device_groups = '';
		variables.devices.forEach(function(device) {
			device.schedule.forEach(function(schedule) {
				device_schedules += JSON.stringify(schedule) + '\n';
			});

			device.watchers.forEach(function(watcher) {
				device_watchers += JSON.stringify(watcher) + '\n';
			});

			if (device.type == 'group') {
				var tempgroup = new classes.device();

				for (var key in device) {
					tempgroup[key] = device[key];
				}
				tempgroup.schedule = [];
				tempgroup.watchers = [];
				device_groups += JSON.stringify(tempgroup) + '\n';
			}
		});

		fs.writeFileSync(sourcefolder + '/userdata/schedules.db.js', device_schedules);
		device_schedules = device_schedules.split('\n');
		device_schedules.forEach(function(schedule) {
			if (schedule.length > 0) {
				schedule = JSON.parse(schedule);
				sharedfunctions.logToFile('Configuration,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Saved Schedule,' + JSON.stringify(schedule), 'Device-' + schedule.deviceid);
			}
		});


		fs.writeFileSync(sourcefolder + '/userdata/watchers.db.js', device_watchers);
		device_watchers = device_watchers.split('\n');
		device_watchers.forEach(function(watcher) {
			if (watcher.length > 0) {
				watcher = JSON.parse(watcher);
				sharedfunctions.logToFile('Configuration,' + devicefunctions.getdeviceproperty(watcher.deviceid, 'name') + ',' + watcher.uniqueid + ',Saved Watcher,' + JSON.stringify(watcher), 'Device-' + watcher.deviceid);
			}
		});


		fs.writeFileSync(sourcefolder + '/userdata/groups.db.js', device_groups);
		device_groups = device_groups.split('\n');
		device_groups.forEach(function(groups) {
			if (groups.length > 0) {
				groups = JSON.parse(groups);
				sharedfunctions.logToFile('Configuration,' + groups.name + ',' + groups.id + ',Saved Group,' + JSON.stringify(groups), 'Device-' + groups.id);
			}
		});

		variables.savetofile = false;
	} // End of WriteToFile

	var difference_milliseconds_recalculate = timestamp_start - lasttimestamp_recalculate;
	var difference_minutes_recalculate = Math.floor((difference_milliseconds_recalculate / 1000) / 60);
	var weatherfetched = false;

	// If the minutes of the hour is either 30 or 0.. Then we do the recalculate.
	var runRecalculate = false;
	if (process.argv[2] == '--dev') {
		if ((timestamp_start.getMinutes() == 30) || (timestamp_start.getMinutes() === 0) || (timestamp_start.getMinutes() == 15) || (timestamp_start.getMinutes() == 45)) {
			runRecalculate = true;
		}
	} else {
		if ((timestamp_start.getMinutes() == 30) || (timestamp_start.getMinutes() === 0)) {
			runRecalculate = true;
		}
	}

	if (runRecalculate === true) {
		lasttimestamp_recalculate = timestamp_start;

		async.series([
			function(callback) {
				sharedfunctions.logToFile('Recalculate,Fetching weather information.', 'Core');
				require('./functions/check_weather').check_weather(callback);
			}
		], function(err, result) {
			sharedfunctions.logToFile('Recalculate,Starting recalculation for schedules.', 'Core');
			if (typeof(variables.weather.weather) != 'undefined') {
				var sunrise = new Date(variables.weather.sys.sunrise * 1000);
				var sunset = new Date(variables.weather.sys.sunset * 1000);
				sunset = gettwodigit(sunset.getHours()) + ":" + gettwodigit(sunset.getMinutes());
				sunrise = gettwodigit(sunrise.getHours()) + ":" + gettwodigit(sunrise.getMinutes());

			}

			// For each device
			variables.devices.forEach(function(device) {

				// For each schedule
				device.schedule.forEach(function(schedule) {

					schedule.criterias.forEach(function(criteria) {

						sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',TriggerTime Before,' + criteria.time, 'Device-' + schedule.deviceid);

						// First we check if the controller is sun-based and define a new ORIGINAL TIME based on that.

						if (criteria.controller == 'Sundown') {
							if (typeof(variables.weather.weather) != 'undefined') {

								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',OriginalTime Before,Sundown: ' + criteria.originaltime, 'Device-' + schedule.deviceid);
								criteria.originaltime = sunset;
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',OriginalTime After,Sundown: ' + criteria.originaltime, 'Device-' + schedule.deviceid);
								variables.savetofile = true;

							} else {
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Failure,Failed updating originaltime because there was no weatherinformation available.', 'Device-' + schedule.deviceid);
							}
						}

						if (criteria.controller == 'Sunrise') {
							if (typeof(variables.weather.weather) != 'undefined') {
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',OriginalTime Before,Sunrise: ' + criteria.originaltime, 'Device-' + schedule.deviceid);
								criteria.originaltime = sunrise;
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',OriginalTime After,Sunrise: ' + criteria.originaltime, 'Device-' + schedule.deviceid);
								variables.savetofile = true;
							} else {
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Failure,Failed updating originaltime because there was no weatherinformation available.', 'Device-' + schedule.deviceid);
							}
						}

						if (schedule.intervalnotbeforecontroller == 'Sundown') {
							if (typeof(variables.weather.weather) != 'undefined') {
								schedule.intervalnotbefore = sunset;
								variables.savetofile = true;
							}
						}

						if (schedule.intervalnotbeforecontroller == 'Sunrise') {
							if (typeof(variables.weather.weather) != 'undefined') {
								schedule.intervalnotbefore = sunrise;
								variables.savetofile = true;
							}
						}

						if (schedule.intervalnotaftercontroller == 'Sundown') {
							if (typeof(variables.weather.weather) != 'undefined') {
								schedule.intervalnotafter = sunset;
								variables.savetofile = true;
							}
						}

						if (schedule.intervalnotaftercontroller == 'Sunrise') {
							if (typeof(variables.weather.weather) != 'undefined') {
								schedule.intervalnotafter = sunrise;
								variables.savetofile = true;
							}
						}

						var original = new Date();
						var timearray = criteria.originaltime.split(':');
						original.setHours(timearray[0]);
						original.setMinutes(timearray[1]);

						if (typeof(variables.weather.weather) != 'undefined') {

							if (variables.options.weathercodes.indexOf(variables.weather.weather[0].id) != -1) {
								// Weather ID found in the approved codes
								// Good weather ( n = minutes )
								sharedfunctions.DateAdd('n', original, Number(schedule.weathergoodfunction + schedule.weathergoodtime));

							} else {
								// Bad weather ( n = minutes )
								sharedfunctions.DateAdd('n', original, Number(schedule.weatherbadfunction + schedule.weatherbadtime));
							}
						}

						var randomfunction = schedule.randomizerfunction;
						if (schedule.randomizerfunction == 'both') {
							var randomvaluefloored = Math.round(Math.random());
							randomfunction = randomvaluefloored;
							if (randomfunction === 0) {
								randomfunction = '+';
							} else {
								randomfunction = '-';
							}
						}

						var triggertime = new Date();
						timearray = criteria.time.split(':');
						triggertime.setHours(timearray[0]);
						triggertime.setMinutes(timearray[1]);

						randomfunction += Math.round(Math.random() * schedule.randomiser);

						var difference_minutes_recalculate_compare = Math.floor(((triggertime - timestamp_start) / 1000) / 60);
						if (difference_minutes_recalculate_compare < 0) {
							sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is in the past. It occured ' + difference_minutes_recalculate_compare + ' minutes ago.', 'Device-' + schedule.deviceid);
						} else if (difference_minutes_recalculate_compare > 0) {
							sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is in the future. It occures in ' + difference_minutes_recalculate_compare + ' minutes.', 'Device-' + schedule.deviceid);
						} else {
							sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is now. Difference between now and TriggerTime is ' + difference_minutes_recalculate_compare, 'Device-' + schedule.deviceid);
						}

						sharedfunctions.DateAdd('n', original, Number(randomfunction));
						var difference_minutes_recalculate_compare_new = Math.floor(((original - timestamp_start) / 1000) / 60);
						hour = gettwodigit(original.getHours());
						minutes = gettwodigit(original.getMinutes());
						// I deliberetly ignore = 0 because if the schedule is set for NOW, no need to recalculate it.
						if (difference_minutes_recalculate_compare > 0) {
							// If the schedule is set to be in the future. Minute Compare to NOW is larger then 0.

							// Only update if the NEW time is in the future aswell.
							if (difference_minutes_recalculate_compare_new > 0) {
								// Update

								criteria.time = hour + ":" + minutes;
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',New,Schedule TriggerTime is now: ' + criteria.time, 'Device-' + schedule.deviceid);
								if (difference_minutes_recalculate_compare < 0) {
									sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is in the past. It occured ' + difference_minutes_recalculate_compare_new + ' minutes ago.', 'Device-' + schedule.deviceid);
								} else if (difference_minutes_recalculate_compare > 0) {
									sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is in the future. It occures in ' + difference_minutes_recalculate_compare_new + ' minutes.', 'Device-' + schedule.deviceid);
								} else {
									sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is now. Difference between now and TriggerTime is ' + difference_minutes_recalculate_compare_new, 'Device-' + schedule.deviceid);
								}
								variables.savetofile = true;
							} else {
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + hour + ":" + minutes + ') is in the past. It occured ' + difference_minutes_recalculate_compare_new + ' minutes ago. [Not saved to schedule. Logged only for information.]', 'Device-' + schedule.deviceid);
							}
						} else if (difference_minutes_recalculate_compare < 0) {
							// If the schedule is set to be in the past. Minute Compare to NOW is less then 0.

							// Only update if the new time is in the past aswell.
							if (difference_minutes_recalculate_compare_new < 0) {
								// Update
								criteria.time = hour + ":" + minutes;
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',New,Schedule TriggerTime is now: ' + criteria.time, 'Device-' + schedule.deviceid);
								if (difference_minutes_recalculate_compare < 0) {
									sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is in the past. It occured ' + difference_minutes_recalculate_compare_new + ' minutes ago.', 'Device-' + schedule.deviceid);
								} else if (difference_minutes_recalculate_compare > 0) {
									sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is in the future. It occures in ' + difference_minutes_recalculate_compare_new + ' minutes.', 'Device-' + schedule.deviceid);
								} else {
									sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + criteria.time + ') is now. Difference between now and TriggerTime is ' + difference_minutes_recalculate_compare_new, 'Device-' + schedule.deviceid);
								}
								variables.savetofile = true;
							} else {
								sharedfunctions.logToFile('Recalculate,' + devicefunctions.getdeviceproperty(schedule.deviceid, 'name') + ',' + schedule.uniqueid + ',Compare,Schedule TriggerTime (' + hour + ":" + minutes + ') is in the future. It occures in ' + difference_minutes_recalculate_compare_new + ' minutes. [Not saved to schedule. Logged only for information.]', 'Device-' + schedule.deviceid);
							}
						}

						// Update criteria in variables.schedulesbyday
						variables.schedulesbyday.forEach(function(day) {
							day.forEach(function(single_criteria) {
								if ( (single_criteria.criteriaid == criteria.criteriaid) && (single_criteria.uniqueid == criteria.uniqueid) ) {
									single_criteria.time = criteria.time;
								}
							})
						})

					})
				})
			})

			var timestamp_end = new Date();
			enddifference = timestamp_end - timestamp_start;
			timestamp_end.setMilliseconds(timestamp_end.getMilliseconds() - enddifference);
			setTimeout(minutecheck, (60000 - enddifference), timestamp_end);
			sharedfunctions.logToFile('Recalculate,Recalculation Complete', 'Core');
		});
	} else {
		timestamp_end = new Date();

		enddifference = timestamp_end - timestamp_start;
		timestamp_end.setMilliseconds(timestamp_end.getMilliseconds() - enddifference);
		setTimeout(minutecheck, (60000 - enddifference), timestamp_end);
	}
}

// Function to send a message to all connected browsers
function sendtoclient(message) {
	io.sockets.emit('message', {
		'message': message
	});
}

function gettwodigit(number) {
	number = '0' + number;
	return number.substr(number.length - 2);
}


exports.sendtoclient = sendtoclient;