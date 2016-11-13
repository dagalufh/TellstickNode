module.exports = {
	devices: [],
	options: {
		city: '',
		port: 8888,
		doubletapcount: 0,
		doubletapseconds: 0,
		weathercodes: [300, 301, 600, 701, 800, 801, 802, 803, 804],
		autoremote_key: '',
		autoremote_password: '',
		autoremote_message: 'Device {device-name} was set to {device-lastcommand}',
		theme: 'blue',
		openweatherappid: '',
		customlogs: [],
		autoremote_onlaunch: false,
		autoremote_onchange: false
	},
	weather: {},
	savetofile: false,
	pauseschedules: false,
	currentversion: '3.0.3',
	doubletap: [],
	disabledoubletap: false,
	rootdir: '',
	restoreInProgress: false,
	schedulesbyday: [
		[],
		[],
		[],
		[],
		[],
		[],
		[]
	],
	refreshdevicestatustimer: 10, // seconds
	getdevicestatusdeadzone: -2, // seconds
	getdevicestatuslastcall: '',
	getdevicestatustimeoutobject: '',
	telldus: undefined,
	telldusmethods: {
		// Device methods
		1: 'TELLSTICK_TURNON',
		2: 'TELLSTICK_TURNOFF',
		4: 'TELLSTICK_BELL',
		8: 'TELLSTICK_TOGGLE',
		16: 'TELLSTICK_DIM',
		32: 'TELLSTICK_LEARN',
		64: 'TELLSTICK_EXECUTE',
		128: 'TELLSTICK_UP',
		256: 'TELLSTICK_DOWN',
		512: 'TELLSTICK_STOP'
	},
	telldusstatus: {
		1: 'On',
		2: 'Off'
	},
	telldusdevicetypes: {
		1: 'TELLSTICK_TYPE_DEVICE',
		2: 'TELLSTICK_TYPE_GROUP',
		3: 'TELLSTICK_TYPE_SCENE'
	},
	tellduschangeevents: {
		1: 'TELLSTICK_DEVICE_ADDED',
		2: 'TELLSTICK_DEVICE_CHANGED',
		3: 'TELLSTICK_DEVICE_REMOVED',
		4: 'TELLSTICK_DEVICE_STATE_CHANGED'
	},
	tellduschangeeventtypes: {
		1: 'TELLSTICK_CHANGE_NAME',
 		2: 'TELLSTICK_CHANGE_PROTOCOL',
		3: 'TELLSTICK_CHANGE_MODEL',
		4: 'TELLSTICK_CHANGE_METHOD',
		5: 'TELLSTICK_CHANGE_AVAILABLE',
		6: 'TELLSTICK_CHANGE_FIRMWARE'
	},
	telldussupportedmethods: '1|2',
	tellduslistenerpointer: function() {},
	telldussensorpointer: function() {},
	telldusdevicechangespointer: function () {},
	lastbootup: ''
};