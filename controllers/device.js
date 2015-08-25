var variables = require('../model/variables');
var classes = require('../model/classes');
var os = require('os');
// Include child_process-module. This allows for the creation of a secondary process to launch external applications.
var exec = require('child_process').exec;
var schedulefunctions = require('./schedulefunctions');
var TellstickNode = require('../TellstickNode');
var sharedfunctions = require('../model/sharedfunctions');
var compareversion = require('compare-version');

// Send a command to a device.
function send(req,res) {
        deviceaction(req.query.deviceid, req.query.switchto);
        variables.doubletap.push({schedule : {deviceid: req.query.deviceid},count : variables.options.doubletapcount, action: req.query.switchto});
    res.send('Send command to device.');
    
}

exports.send = send;
exports.deviceaction = deviceaction;
exports.getdevicestatus = getdevicestatus;
exports.resetdevices = resetdevices;
exports.getresetdevices = getresetdevices;

function deviceaction (deviceid, action, res) {
   if (os.platform() === 'win32') {
        //console.log('Server is a Windows machine. Run tdtool.exe to switch status on device.');
        var sourcefolder = __dirname.replace(/\\/g,"/");
        var path =  sourcefolder + '/../requirements/tdtool.exe';
    } else if (os.platform() == 'linux') {
        //console.log('Server is a Linux machine. Run tdtool to switch status on device.');
        var path = 'tdtool';
    } 
    var actiontotrigger = '';
    if (action.indexOf(':') != -1) {
        var dimsettings = action.split(':');
        actiontotrigger = '--dimlevel ' + dimsettings[1] + ' --'+dimsettings[0];
    } else {
        actiontotrigger = '--'+action;
    }
    if (deviceid.indexOf('group') == -1) {
    exec('"'+path+'" '+ actiontotrigger.toLowerCase() +' ' + deviceid, null, function (error,stdout,stderr) {
            if (typeof(res) !== 'undefined') {
                //res.send(stdout);
            }
        
            var currentdevice = '';
            variables.devices.forEach(function (device) {
                if (device.id == deviceid) {
                    currentdevice = device;
                }
            });
            console.log('Sent command ['+action.toLowerCase() +'] to device ['+currentdevice.name+']'); 
            sharedfunctions.log('Sent command ['+action.toLowerCase() +'] to device ['+currentdevice.name+']');
            if (variables.debug == 'true') {
                sharedfunctions.log('Debug - tdtool set action stderr: ' + stderr);
                sharedfunctions.log('Debug - tdtool set action stdout: ' + stdout);
            }
            //listmodule.updatelist();
            // Request an update of the status of devices.
            getdevicestatus();
        });
    } else {
        variables.devices.forEach(function (device) {
            if (device.id == deviceid) {
                device.devices.forEach(function(device_in_group) {
                    exec('"'+path+'" '+ actiontotrigger.toLowerCase() +' ' + device_in_group, null, function (error,stdout,stderr) {
                        if (typeof(res) !== 'undefined') {
                            //res.send(stdout);
                        }

                        var currentdevice = '';
                        variables.devices.forEach(function (device) {
                            if (device.id == device_in_group) {
                                currentdevice = device;
                            }
                        });
                        console.log('Sent command ['+action.toLowerCase() +'] to device ['+currentdevice.name+']'); 
                        sharedfunctions.log('Sent command ['+action.toLowerCase() +'] to device ['+currentdevice.name+']');
                        if (variables.debug == 'true') {
                            sharedfunctions.log('Debug - tdtool set action stderr: ' + stderr);
                            sharedfunctions.log('Debug - tdtool set action stdout: ' + stdout);
                        }
                        //listmodule.updatelist();
                        // Request an update of the status of devices.
                        getdevicestatus();
                    });
                });
            }
        });
    }
}

function getdevicestatus () {
    
    if (os.platform() === 'win32') {
        //console.log('Server is a Windows machine. Run tdtool.exe to fetch a list of devices.');
        var sourcefolder = __dirname.replace(/\\/g,"/");
        var path =  sourcefolder + '/../requirements/tdtool.exe';
		//console.log(path);
    } else if (os.platform() == 'linux') {
        //console.log('Server is a Linux machine. Run tdtool to switch status on device.');
        var path = 'tdtool';
    } 
    
    exec('"'+path+'" --version', null, function (error,stdout,stderr) {
        var lines = stdout.toString().split('\n');
        var version = lines[0].substr(lines[0].indexOf(' ')+1);

        if (compareversion(version,variables.tdtoolversionlimit) >= 0) {
            exec('"'+path+'" --list-devices', null, function (error,stdout,stderr) {
                //console.log(error);
                var lines = stdout.toString().split('\n');
                lines.forEach(function(line) {
                    if (line.length > 0) {
                        var currentdevice = new classes.device();
                        //console.log('Line: ' + line);
                        var columns = line.split('\t');
                        columns.forEach(function(column) {
                            //console.log('Column:' + column);
                            var data = column.split('=');
                            //console.log('data: ' + data[0]);
                            if (data[0] == "id") {
                                currentdevice.id = data[1].trim();   
                            }
                            if (data[0] == "type") {
                                currentdevice.type = data[1].trim();   
                            }
                            if (data[0] == "name") {
                                currentdevice.name = data[1].trim();   
                            }
                            if (data[0] == "lastsentcommand") {
                                currentdevice.lastcommand = data[1].trim();   
                            }
                            currentdevice.schedule = [];
                            currentdevice.activescheduleid = '';
                            currentdevice.currentstatus = '';
                            currentdevice.activeday = '';

                        });
                        var alreadyinlist = false;
                        variables.devices.forEach(function(device) {
                            if (device.id == currentdevice.id) {
                                if ( (device.lastcommand != currentdevice.lastcommand) && (device.watchers.length > 0) ) {
                                    console.log('There is a watcher connected to this device.');
                                    device.watchers.forEach(function(watcher) {
                                        //console.log('triggerstatus: ' + watcher.triggerstatus.toLowerCase());
                                        //console.log('current device last command: ' + currentdevice.lastcommand.toLowerCase());
                                        //console.log('watcher enabled: ' + watcher.enabled);
                                       if ( (watcher.triggerstatus.toLowerCase() == currentdevice.lastcommand.toLowerCase()) && (watcher.enabled == 'true') ) {
                                           // Create a schedule, runonce.
                                           var currenttime = new Date();

                                           // Add the delay minutes to now when it triggered, so that the desired action is carried out at the correct time.
                                           sharedfunctions.DateAdd('n',currenttime,Number(watcher.delay));

                                           var currenthour = '0' + currenttime.getHours();
                                           var currentminutes = '0' + currenttime.getMinutes();
                                           var triggertime = currenthour.substr(currenthour.length-2) + ":" + currentminutes.substr(currentminutes.length-2);

                                           var watcherschedule = new classes.schedule();
                                           watcherschedule.uniqueid = 'watcher' + currenttime.getTime();
                                           watcherschedule.deviceid = device.id;
                                           watcherschedule.time = triggertime;
                                           watcherschedule.enabled = watcher.enabled;
                                           watcherschedule.action = watcher.setstatus;
                                           watcherschedule.dayofweek = [currenttime.getUTCDay()];
                                           watcherschedule.controller = 'Time';
                                           watcherschedule.runonce = 'true';
                                           watcherschedule.sendautoremote = watcher.autoremoteonschedule;
                                           device.schedule.push(watcherschedule);
                                           variables.savetofile = true;
                                       }
                                    });
                                }
                                
                                device.lastcommand = currentdevice.lastcommand;
                                device.name = currentdevice.name;
                                alreadyinlist = true;
                            }
                        });
                        if (!alreadyinlist) {
                            variables.devices.push(currentdevice);
                        }

                    }
                });
                variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
                schedulefunctions.highlightactiveschedule();
                var devicejson = [];
                for (var i=0; i<variables.devices.length; i++) {
                    var deviceid = variables.devices[i].id;
                    var devicecommand = variables.devices[i].lastcommand;
                    //console.log({ device : deviceid+':'+devicecommand});
                    devicejson.push({ device :  deviceid+':'+devicecommand});
                }
                TellstickNode.sendtoclient(devicejson);     
            });
        } else {
            // This is run if the tdtool is older than version 2.1.2
            exec('"'+path+'" -l', null, function (error,stdout,stderr) {
                var lines = stdout.toString().split('\n');
                var sensorsfound = false;
                lines.forEach(function(line) {
                    if (line.indexOf('sensor') > 0) {
                        sensorsfound = true;
                    }
                    if ( (line.length > 0) && (sensorsfound === false) ) {
                        var currentdevice = new classes.device();
                        //console.log('Line: ' + line);
                        var columns = line.split('\t');

                        //columns[0] = columns[0].toString().replace(/(\r\n|\n|\r)/gm,"none");
                        columns[0] = columns[0].trim();
                        //console.log(columns);

                        if ( (!isNaN(columns[0])) && (columns[0].length > 0)) {

                            //console.log(columns[0].length + " : " + columns[0]);

                            currentdevice.id = columns[0].trim();   
                            currentdevice.type = 'device';  
                            currentdevice.name = columns[1].trim();
                            currentdevice.lastcommand = columns[2].trim();

                            currentdevice.schedule = [];
                            currentdevice.activescheduleid = '';
                            currentdevice.currentstatus = '';
                            currentdevice.activeday = '';
                            
                            var alreadyinlist = false;
                            variables.devices.forEach(function(device) {
                                if (device.id == currentdevice.id) {
                                    if ( (device.lastcommand != currentdevice.lastcommand) && (device.watchers.length > 0) ) {
                                        console.log('There is a watcher connected to this device.');
                                        device.watchers.forEach(function(watcher) {
                                            //console.log('triggerstatus: ' + watcher.triggerstatus.toLowerCase());
                                            //console.log('current device last command: ' + currentdevice.lastcommand.toLowerCase());
                                            //console.log('watcher enabled: ' + watcher.enabled);
                                           if ( (watcher.triggerstatus.toLowerCase() == currentdevice.lastcommand.toLowerCase()) && (watcher.enabled == 'true') ) {
                                               // Create a schedule, runonce.
                                               var currenttime = new Date();

                                               // Add the delay minutes to now when it triggered, so that the desired action is carried out at the correct time.
                                               sharedfunctions.DateAdd('n',currenttime,Number(watcher.delay));

                                               var currenthour = '0' + currenttime.getHours();
                                               var currentminutes = '0' + currenttime.getMinutes();
                                               var triggertime = currenthour.substr(currenthour.length-2) + ":" + currentminutes.substr(currentminutes.length-2);

                                               var watcherschedule = new classes.schedule();
                                               watcherschedule.uniqueid = 'watcher' + currenttime.getTime();
                                               watcherschedule.deviceid = device.id;
                                               watcherschedule.time = triggertime;
                                               watcherschedule.enabled = watcher.enabled;
                                               watcherschedule.action = watcher.setstatus;
                                               watcherschedule.dayofweek = [currenttime.getUTCDay()];
                                               watcherschedule.controller = 'Time';
                                               watcherschedule.runonce = 'true';
                                               watcherschedule.sendautoremote = watcher.autoremoteonschedule;
                                               device.schedule.push(watcherschedule);
                                               variables.savetofile = true;
                                           }
                                        });
                                    }
                                    device.lastcommand = currentdevice.lastcommand;
                                    device.name = currentdevice.name;
                                    alreadyinlist = true;
                                }
                            });
                            if (!alreadyinlist) {
                                variables.devices.push(currentdevice);
                            }
                            
                        }                   

                    }
                });
                variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
                schedulefunctions.highlightactiveschedule();
                var devicejson = [];
                for (var i=0; i<variables.devices.length; i++) {
                    var deviceid = variables.devices[i].id;
                    var devicecommand = variables.devices[i].lastcommand;
                    //console.log({ device : deviceid+':'+devicecommand});
                    devicejson.push({ device :  deviceid+':'+devicecommand});
                }
                TellstickNode.sendtoclient(devicejson);     
                
            });
        }
    });
}

function resetdevices (callback) {
    variables.devices.forEach(function(device) {

        if (device.activescheduleid.toString().length > 0) {
            console.log('Resetting "' + device.name + '" to ' + device.currentstatus + ' as stated by schedule with id: ' + device.activescheduleid);
            sharedfunctions.log('Resetting "' + device.name + '" to ' + device.currentstatus + ' as stated by schedule with id: ' + device.activescheduleid);
            deviceaction(device.id, device.currentstatus);
            // Perhaps add DoubleTap here..
        } else {
            console.log('Found no schedules for ' + device.id + ":" +  device.name);
        }
        
    });
    
    if (typeof(callback) != 'undefined') {
        callback();
    }
}

function getresetdevices(req,res) {
    resetdevices();
    res.send(true);
}