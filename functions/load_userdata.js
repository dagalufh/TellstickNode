// Functions for loading user data.
// This is used on bootup of application and when restoring a backup
module.exports = function(external_callback) {
	var variables = require('../templates/variables');
	var fs = require('fs');
	var async = require('async');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var classes = require(variables.rootdir + 'templates/classes');
	var migrateddevicegroups = {}; // Holds the ID of the devicegroup that has been migrated and it's new ID. This is so that schedules and watchers can be moved to the new device.
	
	async.series([
			function(callback) {
				// Load options
				// Read the options
				fs.readFile(variables.rootdir + 'userdata/options.js', {
					'encoding': 'utf8'
				}, function(err, data) {
					optionsobject = JSON.parse(data);
					for (var key in optionsobject) {
						variables.options[key] = optionsobject[key];
					}

					if (variables.options.doubletapseconds < 1) {
						variables.options.doubletapseconds = 1;
					}
					sharedfunctions.logToFile('Bootprocess,Read options from file.', 'Core');
					sharedfunctions.logToFile('Bootprocess,Running with the following options: ' + JSON.stringify(variables.options), 'Core');
					var optionsjson = JSON.stringify(variables.options, null, 2);
					fs.writeFile(variables.rootdir + 'userdata/options.js', optionsjson, function(err) {
						// Write the options to the file. Saving any additions that has been made.
						if (err) return callback(err);
						sharedfunctions.logToFile('Bootprocess,Saved options back to the file to ensure all options are stored.', 'Core');
						callback();
					});
				});
			},
			function(callback) {
				// Load groups
				sharedfunctions.logToFile('Bootprocess,Loading Devicegroups.', 'Core');
				fs.exists(variables.rootdir + 'userdata/groups.db.js', function(exists) {
					if (exists) {

						var groupsarray = [];
						fs.readFile(variables.rootdir + 'userdata/groups.db.js', {
							'encoding': 'utf8'
						}, function(err, data) {
							
							if (data.length > 1) {
								var rows = data.split('\n');
								for (var i = 0; i < rows.length; i++) {
									if (rows[i].length > 1) {
										groupsarray.push(JSON.parse(rows[i]));
									}
								}
								groupsarray.forEach(function(group) {
									var newgroup = new classes.device();
									var currentdevicegroupfound = false;
									
									for (var key in group) {
										
										if(key == 'lastcommand' ) {
											group[key] = group[key].replace(/-/g,'');
										}
										newgroup[key] = group[key];
									}
									
									for (var i = 0; i < newgroup.devices.length; i++) {
										if (variables.devices.length === 0) {
											break;
										}

										var validmemberid = false;
										
										variables.devices.forEach(function(searchid) {										
											if (searchid.id == newgroup.devices[i]) {

												validmemberid = true;
											}
										});

										if (validmemberid === false) {
											newgroup.devices.splice(i, 1);
											i = -1;
										}
									}

									variables.savetofile = true;
									newgroup.activescheduleid = '';
									newgroup.activeday = '';
									newgroup.currentstatus = '';
									
									variables.devices.forEach(function(device) {
											//console.log(device.name + '==' + newgroup.name);
											if (device.name == newgroup.name) {
												currentdevicegroupfound = true;
											}
									});
									
									// Instead of this PUSH, create the devicegroup
									//variables.devices.push(newgroup);
									if (currentdevicegroupfound === true) {
										sharedfunctions.logToFile('Bootprocess,Found a devicegroup in the files that already existed in telldus: ' + newgroup.name, 'Core');
									} else {
										sharedfunctions.logToFile('Bootprocess,Found a devicegroup in the files that will be added to telldus: ' + newgroup.name, 'Core');
										var newdevicegroupid = variables.telldus.tdAddDevice();
										variables.telldus.tdSetDeviceParameter(newdevicegroupid,'devices',newgroup.devices.join(','));
										variables.telldus.tdSetName(newdevicegroupid, newgroup.name);
										variables.telldus.tdSetProtocol(newdevicegroupid,'group');
										
										migrateddevicegroups[newgroup.id] = newdevicegroupid;
									}
																	
								});

							}
							
							fs.unlink(variables.rootdir + 'userdata/groups.db.js');
							callback();
						});
					} else {
						callback();
					}
				});
			},
			function(callback) {
				sharedfunctions.logToFile('Bootprocess,Loading Schedules.', 'Core');
				// Load schedules
				var schedulesarray = [];
				// Perhaps limit this to start of application. Then work with schedules stored in memory. Only work with files when removing or adding new schedules.
				fs.exists(variables.rootdir + 'userdata/schedules.db.js', function(exists) {
					if (exists) {
						fs.readFile(variables.rootdir + 'userdata/schedules.db.js', {
							'encoding': 'utf8'
						}, function(err, data) {
							if (data.length > 1) {
								var rows = data.split('\n');
								for (var i = 0; i < rows.length; i++) {
									if (rows[i].length > 1) {
										schedulesarray.push(JSON.parse(rows[i]));
									}
								}

								variables.devices.forEach(function(device) {
									//console.log('DeviceID : ' + device.id);
									device.schedule.length = 0;
									schedulesarray.forEach(function(currentschedule) {

										if ( (migrateddevicegroups[currentschedule.deviceid] == device.id ) || (currentschedule.deviceid == device.id) ){
											var newschedule = new classes.schedule();

											for (var key in currentschedule) {
												newschedule[key] = currentschedule[key];
											}
											
											newschedule.deviceid = device.id;
											// Migrate to new handlig of action commands as numbers
											if (isNaN(newschedule.action) === true)  {
												switch(newschedule.action.toLowerCase()) {
													case 'on':
														newschedule.action = 1;
														break;
													case 'off':
														newschedule.action = 2;
														break;
												}
											}

											// Use a foreach so that the schedule stores it's criterias in a array that is used to build below for each day of the schedule.

											if (typeof(newschedule.time) !== 'undefined') {
												var newcriteria = new classes.schedule_criteria();
												newcriteria.controller = newschedule.controller;
												newcriteria.time = newschedule.time;
												//newcriteria.randomizerfunction = newschedule.randomizerfunction;
												//newcriteria.randomiser = newschedule.randomiser;
												//newcriteria.weathergoodfunction = newschedule.weathergoodfunction;
												//newcriteria.weathergoodtime = newschedule.weathergoodtime;
												//newcriteria.weatherbadfunction = newschedule.weatherbadfunction;
												//newcriteria.weatherbadtime = newschedule.weatherbadtime;
												newcriteria.originaltime = newschedule.originaltime;
												newcriteria.criteriaid = newschedule.criterias.length;
												newschedule.criterias.push(newcriteria);
												delete newschedule.time;
												//delete newschedule.randomizerfunction;
												//delete newschedule.randomiser;
												//delete newschedule.weathergoodfunction;
												//delete newschedule.weathergoodtime;
												//delete newschedule.weatherbadfunction;
												//delete newschedule.weatherbadtime;
												delete newschedule.originaltime;
												delete newschedule.controller;
											}
											if (typeof(newschedule.intervalnotbeforecontroller) !== 'undefined') {
												newschedule.criterias.forEach(function(criteria) {
													criteria.intervalnotbeforecontroller = newschedule.intervalnotbeforecontroller;
													criteria.intervalnotaftercontroller = newschedule.intervalnotaftercontroller;
													criteria.intervalnotbefore = newschedule.intervalnotbefore;
													criteria.intervalnotafter = newschedule.intervalnotafter;
												});
												delete newschedule.intervalnotbeforecontroller;
												delete newschedule.intervalnotaftercontroller;
												delete newschedule.intervalnotbefore;
												delete newschedule.intervalnotafter;
											}
											
											newschedule.dayofweek.forEach(function(day) {
												
												newschedule.criterias.forEach(function(criteria) {
													var tempday = new classes.day();
													tempday.criteriaid = criteria.criteriaid;
													tempday.uniqueid = newschedule.uniqueid;
													tempday.time = criteria.time;
													tempday.deviceid = newschedule.deviceid;
													variables.schedulesbyday[day].push(tempday);
												});
											});

											device.schedule.push(newschedule);
											//console.log(device);
										}
									});
								});
							}
							variables.schedulesbyday.forEach(function(schedulearray) {
								schedulearray.sort(sharedfunctions.dynamicSortMultiple('deviceid', 'time'));
							});
							callback();
						});
					} else {
						callback();
					}
				});
			},
			function(callback) {
				sharedfunctions.logToFile('Bootprocess,Loading Watchers.', 'Core');
				// Load watchers
				// Fetch the watchers and apply them to the correct device  
				var watchersarray = [];
				// Perhaps limit this to start of application. Then work with schedules stored in memory. Only work with files when removing or adding new schedules.
				fs.exists(variables.rootdir + 'userdata/watchers.db.js', function(exists) {
					if (exists) {
						fs.readFile(variables.rootdir + 'userdata/watchers.db.js', {
							'encoding': 'utf8'
						}, function(err, data) {
							if (data.length > 1) {
								var rows = data.split('\n');
								for (var i = 0; i < rows.length; i++) {
									if (rows[i].length > 1) {
										watchersarray.push(JSON.parse(rows[i]));
									}
								}
								
								variables.devices.forEach(function(device) {

									device.watchers.length = 0;
									watchersarray.forEach(function(currentwatcher) {
										if ( (migrateddevicegroups[currentwatcher.deviceid] == device.id ) || (device.id == currentwatcher.deviceid) ) {
											var newwatcher = new classes.watcher();
											//console.log('typeof;' + typeof(newwatcher.setstatus));
											for (var key in currentwatcher) {
												newwatcher[key] = currentwatcher[key];
											}
											
											newwatcher.deviceid = device.id;
											
											//console.log('typeof;' + typeof(newwatcher.setstatus));
											if (typeof(newwatcher.setstatus) !== 'undefined') {
												newwatcher.actions.push({
													'id': newwatcher.deviceid,
													'status': newwatcher.setstatus,
													'delay': newwatcher.delay
												});
												delete newwatcher.setstatus;
												delete newwatcher.delay;
											}
											if (isNaN(newwatcher.triggerstatus) === true)  {
													switch(newwatcher.triggerstatus.toLowerCase()) {
														case 'on':
															newwatcher.triggerstatus = 1;
															break;
														case 'off':
															newwatcher.triggerstatus = 2;
															break;
													}
												}
											// Check if any action contains an ID that has been migrated to the new handling of devicegroups
											newwatcher.actions.forEach(function(action) {
												if ( typeof(migrateddevicegroups[currentwatcher.deviceid]) != 'undefined' ) {
													action.id = migrateddevicegroups[currentwatcher.deviceid];
												}
												if (isNaN(action.status) === true)  {
													switch(action.status.toLowerCase()) {
														case 'on':
															action.status = 1;
															break;
														case 'off':
															action.status = 2;
															break;
													}
												}
											});
											
											// Remove the actions that holds invalid devices
											for (var i = 0; i < newwatcher.actions.length; i++) {
												if (variables.devices.length === 0) {
													break;
												}

												var validmemberid = false;

												variables.devices.forEach(function(searchid) {										
													if (searchid.id == newwatcher.actions[i].id) {

														validmemberid = true;
													}
												});

												if (validmemberid === false) {
													newwatcher.actions.splice(i, 1);
													i = -1;
												}
											}

											device.watchers.push(newwatcher);
										}
									});
								});
							}
							callback();
						});

					} else {
						callback();
					}
				});
			}
		],
		function() {
			
			external_callback();
		});
};