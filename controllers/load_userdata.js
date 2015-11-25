// Functions for loading user data.
// This is used on bootup of application and when restoring a backup
var variables = require('../model/variables');

module.exports = function (external_callback) {
    var fs = require('fs');
    var async = require('async');
    var sharedfunctions = require('../model/sharedfunctions');
    var classes = require('../model/classes');
    
    async.series([
    function (callback) {
        // Load options
        
        // Read the options
        fs.readFile(variables.rootdir + 'userdata/options.js',{'encoding':'utf8'},function(err,data) {
            optionsobject = JSON.parse(data);
            for (var key in optionsobject) {
              variables.options[key] = optionsobject[key];  
            }
            
			if (variables.options.doubletapseconds < 1) {
				variables.options.doubletapseconds = 1;
			}
            
            console.log(variables.options);
            sharedfunctions.log('Startup - Read options from file.');
			
            var optionsjson = JSON.stringify(variables.options,null,2);
            fs.writeFile(variables.rootdir + 'userdata/options.js',optionsjson, function(err) {
                // Write the options to the file. Saving any additions that has been made.
                if(err) return callback(err);
                sharedfunctions.log('Saved the default options.');
                callback();
            });    
        });
    },
    function (callback) {
        // Load groups
        fs.exists(variables.rootdir + 'userdata/groups.db.js', function (exists) {
            if (exists) {
                var groupsarray = [];
                fs.readFile(variables.rootdir + 'userdata/groups.db.js',{'encoding':'utf8'},function(err,data) {
                    if (data.length>1) {
                       var rows = data.split('\n');
                        for (var i=0; i<rows.length; i++) {
                            if (rows[i].length > 1) {
                                groupsarray.push(JSON.parse(rows[i]));
                            }
                        }
                        
                        groupsarray.forEach (function (group) {
                            var newgroup = new classes.device();

                            for (var key in group) {
                              newgroup[key] = group[key];  
                            }

                            for (var i=0; i < newgroup.devices.length; i++) {
                                var validmemberid = false;
                                variables.devices.forEach(function(searchid) {
                                    console.log(searchid.id + ' == ' + newgroup.devices[i])
                                    if (searchid.id == newgroup.devices[i]) {
                                        console.log('Match found in above string');
                                        validmemberid = true;
                                    }
                                });

                                if (validmemberid === false) {

                                    console.log(newgroup.devices.splice(i,1));
                                    i=0;

                                }
                            };
                            variables.savetofile = true;
                            variables.devices.push(newgroup);
                            
                        });
                       
                    }
                    variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
                    callback();
                });
            } else {
                callback();
            }
        });
    },
    function (callback) {
        // Load schedules
        var schedulesarray = [];
        // Perhaps limit this to start of application. Then work with schedules stored in memory. Only work with files when removing or adding new schedules.
        fs.exists(variables.rootdir + 'userdata/schedules.db.js', function (exists) {
            if(exists) {
                fs.readFile(variables.rootdir + 'userdata/schedules.db.js',{'encoding':'utf8'},function(err,data) {
                    if (data.length>1) {
                       var rows = data.split('\n');
                        for (var i=0; i<rows.length; i++) {
                            if (rows[i].length > 1) {
                                schedulesarray.push(JSON.parse(rows[i]));
                            }
                        }

                        variables.devices.forEach(function(device) {
                            //console.log('DeviceID : ' + device.id);
                            device.schedule.length = 0;
                            schedulesarray.forEach (function (currentschedule) {
                                if (device.id == currentschedule.deviceid) {
                                    var newschedule = new classes.schedule();

                                    for (var key in currentschedule) {
                                      newschedule[key] = currentschedule[key];  
                                    }
                                    
                                    device.schedule.push(newschedule);
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
    },
    function (callback) {
        // Load watchers
         // Fetch the watchers and apply them to the correct device  
        var watchersarray = [];
        // Perhaps limit this to start of application. Then work with schedules stored in memory. Only work with files when removing or adding new schedules.
        fs.exists(variables.rootdir + 'userdata/watchers.db.js', function (exists) {
            if(exists) {
                fs.readFile(variables.rootdir + 'userdata/watchers.db.js',{'encoding':'utf8'},function(err,data) {
                    if (data.length>1) {
                       var rows = data.split('\n');
                        for (var i=0; i<rows.length; i++) {
                            if (rows[i].length > 1) {
                                watchersarray.push(JSON.parse(rows[i]));
                            }
                        }

                        variables.devices.forEach(function(device) {
                            //console.log('DeviceID : ' + device.id);
                            device.watchers.length = 0;
                            watchersarray.forEach (function (currentwatcher) {
                                if (device.id == currentwatcher.deviceid) {
                                    var newwatcher = new classes.watcher();

                                    for (var key in currentwatcher) {
                                      newwatcher[key] = currentwatcher[key];  
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
    }],
    function () { 
        external_callback();
    });
}