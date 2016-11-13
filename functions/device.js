// Include child_process-module. This allows for the creation of a secondary process to launch external applications.
exports.doubletapcheck = doubletapcheck;
exports.send = send;
exports.sendcommandtodevice = sendcommandtodevice;
exports.resetdevices = resetdevices;
exports.getresetdevices = getresetdevices;
exports.getdeviceproperty = getdeviceproperty;
exports.addtodoubletap = addtodoubletap;
exports.executewatcher = executewatcher;

// Doubletap interval check
function doubletapcheck() {
	var variables = require('../templates/variables');

	var timestamp_start = new Date();

	// Do not run if restore is in progress.
	if ((variables.restoreInProgress === true) || (variables.disabledoubletap === true)) {
		setTimeout(doubletapcheck, ((1000 * variables.options.doubletapseconds) + (timestamp_start - new Date().getTime())));
		return;
	}

	variables.doubletap.forEach(function(repeatschedule) {
		if (repeatschedule.count > 0) {
			sendcommandtodevice(repeatschedule.schedule.deviceid, repeatschedule.action, 'Repeater');
			repeatschedule.count = repeatschedule.count - 1;
		}
	});

	for (var i = 0; i < variables.doubletap.length; i++) {
		if (variables.doubletap[i].count < 1) {
			variables.doubletap.splice(i, 1);
			i = -1;
		}
	}

	if (variables.options.doubletapseconds < 1) {
		variables.options.doubletapseconds = 1;
	}

	setTimeout(doubletapcheck, ((1000 * variables.options.doubletapseconds) + (timestamp_start - new Date().getTime())));
}

// Send a command to a device.
function send(req, res) {
	sendcommandtodevice(req.query.deviceid, req.query.switchto, 'Manual(' + req.connection.remoteAddress + ')');
	addtodoubletap({
		deviceid: req.query.deviceid
	}, req.query.switchto);
	res.send('Send command to device.');

}

function addtodoubletap(targetdeviceid, targetaction) {
	var variables = require('../templates/variables');
	variables.disabledoubletap = true;
	for (var i = 0; i < variables.doubletap.length; i++) {
		if (variables.doubletap[i].schedule.deviceid == targetdeviceid.deviceid) {
			variables.doubletap.splice(i, 1);
			i = -1;
		}
	}

	variables.doubletap.push({
		schedule: targetdeviceid,
		count: variables.options.doubletapcount,
		action: targetaction
	});

	variables.disabledoubletap = false;
}

function sendcommandtodevice(deviceid, command, source) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

	var device = getdeviceproperty(deviceid, '*');
	command = Number(command);
	//if (device.type == 1) {
		switch (command) {
			case 1:
				//sharedfunctions.logToFile(__filename + ' > ' + arguments.callee.name + '() variables.telldus.tdTurnOn(deviceid)', 'inactiveTelldusCommands');
				if (process.argv[3] != '--nosend') {
					variables.telldus.tdTurnOn(deviceid);
				} else {
					sharedfunctions.logToFile(__filename + ' > ' + arguments.callee.name + '() variables.telldus.tdTurnOn(deviceid)', 'dev');
				}
				sharedfunctions.logToFile('Action,' + getdeviceproperty(deviceid, 'name') + ',' + source + ',' + variables.telldusmethods[command] + ',Sent command ' + variables.telldusmethods[command] + ' to device.', 'Device-' + deviceid);
				break;
			case 2:
				//sharedfunctions.logToFile(__filename + ' > ' + arguments.callee.name + '() variables.telldus.tdTurnOff(deviceid)', 'inactiveTelldusCommands');
				if (process.argv[3] != '--nosend') {
					variables.telldus.tdTurnOff(deviceid);
				} else {
					sharedfunctions.logToFile(__filename + ' > ' + arguments.callee.name + '() variables.telldus.tdTurnOff(deviceid)', 'dev');
				}
				sharedfunctions.logToFile('Action,' + getdeviceproperty(deviceid, 'name') + ',' + source + ',' + variables.telldusmethods[command] + ',Sent command ' + variables.telldusmethods[command] + ' to device.', 'Device-' + deviceid);
				break;
			default:
				sharedfunctions.logToFile('Unknown commandnumber received. Received: ' + command, 'dev');
		}
	/*
	} else if (device.type == 2) {
		device.devices.forEach(function(child_device) {
			switch (command) {
				case 1:
					//sharedfunctions.logToFile(__filename + ' > ' + arguments.callee.name + '() variables.telldus.tdTurnOn(child_device)', 'inactiveTelldusCommands');
					if (process.argv[3] != '--nosend') {
						variables.telldus.tdTurnOn(child_device);
					}
					sharedfunctions.logToFile('Action,' + getdeviceproperty(deviceid, 'name') + ',' + source + ',' + variables.telldusmethods[command] + ',Sent command ' + variables.telldusmethods[command] + ' to device as part of device group.', 'Device-' + child_device);
					break;
				case 2:
					//sharedfunctions.logToFile(__filename + ' > ' + arguments.callee.name + '() variables.telldus.tdTurnOff(child_device)', 'inactiveTelldusCommands');
					if (process.argv[3] != '--nosend') {
						variables.telldus.tdTurnOff(child_device);
					}
					sharedfunctions.logToFile('Action,' + getdeviceproperty(deviceid, 'name') + ',' + source + ',' + variables.telldusmethods[command] + ',Sent command ' + variables.telldusmethods[command] + ' to device as part of device group.', 'Device-' + child_device);
					break;
				default:
					sharedfunctions.logToFile('Unknown commandnumber received. Received: ' + command, 'dev');
			}
		});
	}
	*/
}

function resetdevices(callback) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	
	variables.devices.forEach(function(device) {
		
		// Reset device to the last known command that was sent.
		// ONLY reset real devices, not device groups!
		
		if (device.type == 1) {
			sharedfunctions.logToFile('Reset,' + JSON.stringify(device), 'Core');
			var setstatus = device.lastcommand;
			var activescedule = device.activescheduleid;
			if ((device.activescheduleid.toString().length > 0) && (device.activescheduleid.toString().indexOf('watcher') == -1)) {
				// If there is an active schedule, reset it to that state instead.
				setstatus = device.currentstatus;
			} else {
				activescedule = '';
			}

			sharedfunctions.logToFile('Reset,' + device.name + ',' + activescedule + ',' + variables.telldusstatus[device.lastcommand] + ',Reset device to status: ' + variables.telldusstatus[setstatus], 'Device-' + device.id);
			sendcommandtodevice(device.id, setstatus, 'Reset');
		}
	});

	if (typeof(callback) != 'undefined') {
		callback();
	}

}

function getresetdevices(req, res) {
	resetdevices();
	res.send(true);
}

function getdeviceproperty(deviceid, property) {
	var variables = require('../templates/variables');
	var returnvalue = '';
	variables.devices.forEach(function(device) {
		if (device.id == deviceid) {
			if (property == '*') {
				returnvalue = device;
			} else {
				returnvalue = device[property];
			}
		}
	});

	return returnvalue;
}


function executewatcher(watcher) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var classes = require(variables.rootdir + 'templates/classes');
	watcher.actions.forEach(function(action) {

		if (action.delay > 0) {
			// Create a schedule, runonce.
			var currenttime = new Date();

			// Add the delay minutes to now when it triggered, so that the desired action is carried out at the correct time.
			sharedfunctions.DateAdd('n', currenttime, Number(action.delay));
			var triggertime = sharedfunctions.gettwodigit(currenttime.getHours()) + ":" + sharedfunctions.gettwodigit(currenttime.getMinutes());
            
            // If triggertime is in the "past" clockwise, the dayofweek needs to be +1
            
            
            
           // var watcherexecutedtime = new Date();

           // var minutedifference_currenttime_watcherexecutedtime = Math.floor(((currenttime - watcherexecutedtime) / 1000) / 60);
           // sharedfunctions.logToFile('IntervalNotAfter timediff: ' + minutedifference_currenttime_watcherexecutedtime, 'dev');

            
            
            
            

			var watcherschedule = new classes.schedule();
			watcherschedule.uniqueid = 'watcher' + currenttime.getTime();
			watcherschedule.deviceid = action.id;
			watcherschedule.enabled = watcher.enabled;
			watcherschedule.action = action.status;
			watcherschedule.dayofweek = [currenttime.getUTCDay()];
			watcherschedule.controller = 'Time';
			watcherschedule.runonce = 'true';
			watcherschedule.sendautoremote = watcher.autoremoteonschedule;
            
            /*
            if (minutedifference_currenttime_watcherexecutedtime < 0) {
                // if less than 0, currenttime is before watcherexecutedtime (based on time of day)
                // This means that the new schedule created by this watcher needs to be on the day after today.
                
                if (watcherschedule.dayofweek == 6) {
                 watcherschedule.dayofweek = 0;
                } else {
                 watcherschedule.dayofweek++;
                }
            }
            */
            

			var newcriteria = new classes.schedule_criteria();
			newcriteria.controller = 'Time';
			newcriteria.time = triggertime;
			newcriteria.originaltime = triggertime;
			newcriteria.criteriaid = watcherschedule.criterias.length;
			watcherschedule.criterias.push(newcriteria);

			watcherschedule.dayofweek.forEach(function(day) {

				watcherschedule.criterias.forEach(function(criteria) {
					var tempday = new classes.day();
					tempday.criteriaid = criteria.criteriaid;
					tempday.uniqueid = watcherschedule.uniqueid;
					tempday.time = criteria.time;
					tempday.deviceid = watcherschedule.deviceid;
					variables.schedulesbyday[day].push(tempday);
				});
			});
			variables.devices.forEach(function(targetdevice) {
				if (targetdevice.id == watcherschedule.deviceid) {
					targetdevice.schedule.push(watcherschedule);
				}
			});
			sharedfunctions.logToFile('Schedule,' + getdeviceproperty(watcherschedule.id, 'name') + ',' + watcherschedule.uniqueid + ',Create,Watcher Event triggered creation of Run-Once schedule: ' + JSON.stringify(watcherschedule), 'Device-' + watcherschedule.deviceid);
			variables.savetofile = true;
		} else {
			sendcommandtodevice(action.id, action.status, 'WatcherInstantTrigger');
            if (watcher.autoremoteonschedule == 'true') {
                sharedfunctions.autoremote(getdeviceproperty(action.id, 'name'), variables.telldusstatus[action.status]);
            }
            
            
		}
	});
}