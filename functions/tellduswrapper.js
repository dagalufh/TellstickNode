exports.initiatetelldus = initiatetelldus;
exports.getalldevices = getalldevices;
exports.initiatedevicelistener = initiatedevicelistener;
exports.initiatesensorlistener = initiatesensorlistener;
exports.initiatedevicechangeslistener = initiatedevicechangeslistener;

function initiatetelldus() {
	var variables = require('../templates/variables');
	var ref = require('ref');
	var FFI = require('ffi');
	var os = require('os');
	var tellduslibrary = '';
	// Check was OS we are on, this controlls what DLL to load.
	if (os.platform() === 'win32') {
		tellduslibrary = 'TelldusCore';
	} else if (os.platform() == 'linux') {
		tellduslibrary = 'libtelldus-core.so.2';
	}

	variables.telldus = new FFI.Library(tellduslibrary, {
		tdGetNumberOfDevices: ["int", []],
		tdRegisterDeviceEvent: ["int", ["pointer", "void"]],
		tdRegisterDeviceChangeEvent: ["int", ["pointer", "void"]],
		tdRegisterSensorEvent: ["int", ["pointer", "void"]],
		tdGetDeviceId: ["int", ["int"]],
		tdGetName: ["string", ["int"]], // Requires: tdReleaseString()
		tdGetDeviceType: ['int', ['int']],
		tdLastSentCommand: ['int', ['int', 'int']],
		tdTurnOn: ['int', ['int']],
		tdTurnOff: ['int', ['int']],
		tdAddDevice: ['int', []],
		tdReleaseString: ['void',['string']],
		tdRemoveDevice: ['bool', ['int']],
		tdSetName: ['bool', ['int', 'string']],
		tdGetModel: ['string',['int']], // Requires: tdReleaseString()
		tdSetProtocol: ['bool', ['int', 'string']],
		tdGetProtocol: ['string',['int']], // Requires: tdReleaseString()
		tdSetDeviceParameter: ['bool', ['int', 'string', 'string']],
		tdGetDeviceParameter: ['string', ['int', 'string', 'string']], // Requires: tdReleaseString()
		tdMethods: ['int',['int','int']]
	});

}

function getalldevices() {

	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var classes = require(variables.rootdir + 'templates/classes');
	var totaldevices = variables.telldus.tdGetNumberOfDevices();
	//console.log(totaldevices);
	for (var i = 0; i < totaldevices; i++) {
		var device = new classes.device();
		device.id = variables.telldus.tdGetDeviceId(i);
		device.name = variables.telldus.tdGetName(device.id);
		//variables.telldus.tdReleaseString(device.name);
		
		device.type = variables.telldus.tdGetDeviceType(device.id);
		device.lastcommand = variables.telldus.tdLastSentCommand(device.id, variables.telldussupportedmethods);
		if (device.type == 2) {
			var devicesingroup = variables.telldus.tdGetDeviceParameter(device.id, 'devices','none');
			//variables.telldus.tdReleaseString(devicesingroup);
			//console.log(devicesingroup);
			if (devicesingroup == 'none') {
				device.devices = [];
			} else {
				device.devices = devicesingroup.split(',');
			}
		}
		//sharedfunctions.logToFile(JSON.stringify(device), 'dev');
		variables.devices.push(device);
	}
    variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
}

function initiatedevicelistener() {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var devicefunctions = require(variables.rootdir + 'functions/device');
	var schedulefunctions = require(variables.rootdir + 'functions/schedulefunctions');
	var TellstickNode = require(variables.rootdir + 'TellstickNode');
	var ref = require('ref');
	var FFI = require('ffi');

	sharedfunctions.logToFile('Bootprocess,Telldus Device Listener Started.', 'Core');

	// Define the callback to be executed when a device event occures in the driver
	var cb = function(id, status) {
		//sharedfunctions.logToFile('DeviceEvent,Device with ID( ' + id + ' ) has new status: ' + status, 'Core');
		var devicefound = false;
		variables.devices.forEach(function(device) {
			if (device.id == id) {
				devicefound = true;
				var statechange = false;
				if (device.lastcommand != status) {
					statechange = true;
				}
				sharedfunctions.logToFile('DeviceEvent,Device with ID( ' + id + ' ) has changed status from ' + device.lastcommand + ' to ' + status, 'Core');
                
                 // Before we trigger a new watcher, check if there is a schedule that is for the new state of the device that is already created by a watcher, then remove it.
                
                
                
                // Check all schedules that are on the device, check if there is any schedule that is a watcher created one and for this specific statue.
                // If it is, remove that schedule.
                
                if (typeof(device.schedule) != 'undefined')  {
                    //sharedfunctions.logToFile('[Before forEach] deviceID ' + device.id + "; scheduleID " + JSON.stringify(device.schedule) , 'dev');
                    device.schedule.forEach(function(singleschedule) {
                        //sharedfunctions.logToFile('[Inside forEach] deviceID ' + device.id + "; scheduleID " + JSON.stringify(singleschedule) , 'dev');
                       // sharedfunctions.logToFile('[inside forEach] deviceID ' + device.id + "; scheduleID " + JSON.stringify(schedule) , 'dev');
                        if (singleschedule.uniqueid.toString().indexOf("watcher") != -1) {
                            // The current schedule is created by a watcher
                            if (singleschedule.action == status) {
                                //sharedfunctions.logToFile('Schedule to be removed: ' + JSON.stringify(singleschedule) , 'dev');
                                sharedfunctions.logToFile('DeviceEvent,Removed schedule (' + JSON.stringify(singleschedule) + ') from Device with ID( ' + id + ' )', 'Core');
                                schedulefunctions.removeschedule([singleschedule.uniqueid]);
                            }
                        }                   

                    })
                }
                
                
                
				// -- INSERT WATCHER HERE --
				device.watchers.forEach(function(watcher) {
					if (((watcher.onstatechanged === "true") && (statechange === true)) || ((watcher.oncommandsent === "true") && (statechange === false))) {
						
                        
                       
						
						// Incorporate below somehow
						// if ((watcher.triggerstatus.toLowerCase() == currentdevice.lastcommand.toLowerCase()) && (watcher.enabled == 'true') && (watcher.oncommandsent == 'true')) {
						//
						// trigger watcher
						if (watcher.triggerstatus.toLowerCase() == status) {
							sharedfunctions.logToFile('DeviceEvent,Watcher triggered for Device with ID( ' + id + ' ) Watcher: ' + JSON.stringify(watcher), 'Core');
							devicefunctions.executewatcher(watcher);
						}
					}
				})
				device.lastcommand = status;
				TellstickNode.sendtoclient([{
					device: device.id + ':' + device.lastcommand
				}]);
				if (variables.options.autoremote_onchange == 'true') {
					sharedfunctions.autoremote(device.name, variables.telldusstatus[device.lastcommand]);
				}
			}
		})

		/*
		The device should exist already. Always, if a sate can be changed, it should have been a added device event first.
		if (devicefound === false) {
			// Is this even needed due to having catched added devices on devicechangeevent?
			var device = new classes.device();
			device.id = id;
			device.name = variables.telldus.tdGetName(device.id);
			device.type = variables.telldus.tdGetDeviceType(device.id);
			device.lastcommand = variables.telldus.tdLastSentCommand(device.id, variables.telldussupportedmethods);

			sharedfunctions.logToFile(JSON.stringify(device), 'dev');
			variables.devices.push(device);
		}
		*/
		schedulefunctions.highlightactiveschedule();
	}
	variables.tellduslistenerpointer = FFI.Callback('int', ['int', 'int'], cb) // Pointer that holds the callback
	variables.telldus.tdRegisterDeviceEvent(variables.tellduslistenerpointer, 0)
}

function initiatesensorlistener() {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var ref = require('ref');
	var FFI = require('ffi');

	sharedfunctions.logToFile('Bootprocess,Telldus Sensor Listener Started.', 'Core');

	// Define the callback to be executed when a device event occures in the driver
	var cb = function(id, status) {
		sharedfunctions.logToFile('Received an event on sensor with id(' + id + ') that reported status: ' + status, 'sensors');
		// Check if device is in list. If so update the last command sent.
		// Also, here should the watcher thingys be.
		//console.log(hour + ':' + minutes + ':' + seconds + ':' + milliseconds + ' Device with ID: ' + id + ' executed the method: ' + TellstickMethods[status]);
	}
	variables.telldussensorpointer = FFI.Callback('int', ['int', 'int'], cb) // Pointer that holds the callback
	variables.telldus.tdRegisterSensorEvent(variables.telldussensorpointer, 0)
}

function initiatedevicechangeslistener() {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var ref = require('ref');
	var FFI = require('ffi');
	var classes = require(variables.rootdir + 'templates/classes');

	sharedfunctions.logToFile('Bootprocess,Telldus Controller Listener Started.', 'Core');

	// Define the callback to be executed when a device event occures in the driver
	var cb = function(id, changeevent, changetype) {
		sharedfunctions.logToFile('Received an event on device with id(' + id + ') that reported the change: ' + variables.tellduschangeevents[changeevent] + '(' + variables.tellduschangeeventtypes[changetype] + ')', 'deviceevents');
		// Check if device is in list. If so update the last command sent.
		// Also, here should the watcher thingys be.
		//console.log(hour + ':' + minutes + ':' + seconds + ':' + milliseconds + ' Device with ID: ' + id + ' executed the method: ' + TellstickMethods[status]);
		switch (changeevent) {
			case 1:
				var device = new classes.device();
				device.id = id;
				device.name = variables.telldus.tdGetName(device.id);
				//variables.telldus.tdReleaseString(device.id);
				device.type = variables.telldus.tdGetDeviceType(device.id);
				device.lastcommand = variables.telldus.tdLastSentCommand(device.id, variables.telldussupportedmethods);
				if (device.type == 2) {
					var devicesingroup = variables.telldus.tdGetDeviceParameter(device.id, 'devices', 'none');
					//variables.telldus.tdReleaseString(devicesingroup);
					//console.log(devicesingroup);
					if (devicesingroup == 'none') {
						device.devices = [];
					} else {
						device.devices = devicesingroup.split(',');
					}
				}
				//console.log(device);
				//sharedfunctions.logToFile(JSON.stringify(device), 'dev');
				variables.devices.push(device);
				variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
				break;
			case 2:
				variables.devices.forEach(function(device) {
					if (device.id == id) {

						device.name = variables.telldus.tdGetName(device.id);
						//variables.telldus.tdReleaseString(device.id);
						device.type = variables.telldus.tdGetDeviceType(device.id);
						device.lastcommand = variables.telldus.tdLastSentCommand(device.id, variables.telldussupportedmethods);
						if (device.type == 2) {
							var devicesingroup = variables.telldus.tdGetDeviceParameter(device.id, 'devices', 'none');
							//variables.telldus.tdReleaseString(devicesingroup);
							//console.log(devicesingroup);
							if (devicesingroup == 'none') {
								device.devices = [];
							} else {
								device.devices = devicesingroup.split(',');
							}
						}

						variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
						//console.log(device);
					}
				})
				break;
			case 3:
				sharedfunctions.logToFile('A device that had id ' + id + ' has been removed.', 'deviceevents');

				// Remove from Schedulesbyday
				variables.schedulesbyday.forEach(function(day) {
					for (var i = 0; i < day.length; i++) {
						if (id == day[i].deviceid) {
							day.splice(i, 1);
							i = -1;
						}
					}
				});

				// Remove any references to the device
				for (var i = 0; i < variables.devices.length; i++) {
					if (variables.devices[i].id == id) {
						sharedfunctions.logToFile('DeviceGroup,' + variables.devices[i].name + ',NULL,REMOVED,Device was removed: ' + JSON.stringify(variables.devices[i]), 'Device-' + variables.devices[i].id);
						variables.devices.splice(i, 1);
					}
				}

				variables.savetofile = true;
		}
	}
	variables.telldusdevicechangespointer = FFI.Callback('int', ['int', 'int', 'int'], cb) // Pointer that holds the callback
	variables.telldus.tdRegisterDeviceChangeEvent(variables.telldusdevicechangespointer, 0)
}