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
    deviceaction(req.query.deviceid, req.query.switchto, res);
}

exports.send = send;
exports.deviceaction = deviceaction;
exports.getdevicestatus = getdevicestatus;


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
    
    exec('"'+path+'" '+ actiontotrigger.toLowerCase() +' ' + deviceid, null, function (error,stdout,stderr) {
            if (typeof(res) !== 'undefined') {
                res.send(stdout);
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