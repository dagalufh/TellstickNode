process.chdir(__dirname);
var variables = require('./model/variables');
var fs = require('fs');
var async = require('async');
var dns = require('dns');
var os = require('os');
var exec = require('child_process').exec;
var classes = require('./model/classes');
var express = require('express');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var io = require('socket.io')(app);
var devicefunctions = require('./controllers/device');
var schedulefunctions = require('./controllers/schedulefunctions');
var app = express();

var http = require('http');		
var compareversion = require('compare-version');

var sharedfunctions = require('./model/sharedfunctions');


var lasttimestamp_recalculate = new Date();



// Use the sessionhandler from express-session 60 * 60 * 1000
app.use(session({
    secret:'thisisasecret',
    cookie: { maxAge: (1000*60)*120 },
    resave: true,
    saveUninitialized: false,
    store: new FileStore()
    }));

// Require a parser for handling POST requests and use it.
var bodyparser = require('body-parser');
app.use(bodyparser.urlencoded({ extended: true }));

 // Define a folder containing the static files. This is the css files or client side js files
app.use(express.static(__dirname + '/assets'));

// Include the function that handles routing.
require('./router.js')(app);

async.series([
    function (callback) {
      fs.exists(__dirname + '/userdata', function (exists) {
            if (!exists) {
                fs.mkdir(__dirname + '/userdata', function () {
                    callback();
                });
            } else {
                callback();
            }
      });
    },
    function (callback) {
        // Check if the optionsfile already exists or not. otherwise, create it.
        fs.exists(__dirname + '/userdata/options.js', function (exists) {
            var optionsobject = {};
            
            if (!exists) {
                // Define default options
                                
                var optionsjson = JSON.stringify(variables.options,null,2);
                fs.writeFile(__dirname + '/userdata/options.js',optionsjson, function(err) {
                    // Write the default options to the file.
                    if(err) return callback(err);
                    console.log('Saved the default options.');
                    callback();
                });
            } else {
                callback();
            }
        });
        
    },
    
    function (callback) {
        
        // Read the options
        fs.readFile(__dirname + '/userdata/options.js',{'encoding':'utf8'},function(err,data) {
            optionsobject = JSON.parse(data);
            for (var key in optionsobject) {
              variables.options[key] = optionsobject[key];  
            }
            //variables.options = optionsobject;
			if (variables.options.doubletapseconds < 1) {
				variables.options.doubletapseconds = 1;
			}
            console.log(variables.options);
            sharedfunctions.log('Startup - Read options from file.');
			
            var optionsjson = JSON.stringify(variables.options,null,2);
            fs.writeFile(__dirname + '/userdata/options.js',optionsjson, function(err) {
                // Write the options to the file. Saving any additions that has been made.
                if(err) return callback(err);
                console.log('Saved the default options.');
                callback();
            });    
        });
    },
    function (callback) {
        // Check if the optionsfile already exists or not. otherwise, create it.
         fs.exists(__dirname + '/changelog.txt', function (exists) {
            if(exists) {
                fs.readFile(__dirname + '/changelog.txt',{'encoding':'utf8'},function(err,data) {
                    if (data.length>1) {
                       var rows = data.split('\n');
                        var changelog = 'Changelog for ';
                        for (var i=0; i<rows.length; i++) {
                            if (rows[i].length > 1) {
                                changelog = changelog + rows[i] + '<br>';
                            } else {
                                break;
                            }
                        }
                        sharedfunctions.log(changelog);
                    }
                    callback();
                });
            } else {
                callback();
            }
         });
        
    },
    function (callback) {
        // Fetch weather information
        if (variables.options.city.toString().length > 0) {
            //weather.setCity(encodeURIComponent(variables.options.city));
            dns.lookup('api.openweathermap.org',function onLookup (err) {
                if (err) { 
                    console.log('Unable to reach api.openweathermap.org');
                    callback();
                } else {
					var options = {
						host : 'api.openweathermap.org',
						path: '/data/2.5/weather?q=' + encodeURIComponent(variables.options.city) + '&units=metric&lang=en'
					};
					  
					var reg = http.get(options, function(res){
						//console.log(res);
						res.setEncoding('utf-8');
						console.log(res.statusCode);
						  
						if (res.statusCode == 200) {
				            res.on('data', function (chunk) {
                                var parsed = {};

                                try {				
                                    console.log('Fetched new weatherinfo.');
                                    sharedfunctions.log('Startup - Fetched weather information');
                                    variables.weather = JSON.parse(chunk)
                                } catch (e) {
                                    console.log('Error with fetching the weather. Openweathermap.org might be busy or something.');
                                    sharedfunctions.log('Startup - Error with fetching the weather. Openweathermap.org might be busy or something.');
                                }
						    });
                            res.on('error', function (chunk) {
                                // Error
                            });
						} else {
							console.log('openweather: error. Received wrong statuscode');
                            sharedfunctions.log('Startup - Openweather: error. Received wrong statuscode');
						}
						callback();
					}); 
					//console.log(reg);
                   /* weather.getAllWeather(function(err, JSONObj){
						if (typeof(JSONObj.error) == 'undefined') {
							variables.weather = JSONObj;
						} else {
							console.log('Error with fetching the weather. Openweathermap.org might be busy or something.');
						}
						
                        callback();
                    });
				   */
                }
            });
        } else {
            console.log('No city provided. Unable to fetch weather information.');
            sharedfunctions.log('Startup - No city provided. Unable to fetch weather information.');
            callback();
        }
        
    },
    
    function (callback) {
        // get the list of devices
        if (os.platform() === 'win32') {
            //console.log('Server is a Windows machine. Run tdtool.exe to fetch a list of devices.');
            var sourcefolder = __dirname.replace(/\\/g,"/");
            var path =  sourcefolder + '/./requirements/tdtool.exe';
        } else if (os.platform() == 'linux') {
            //console.log('Server is a Linux machine. Run tdtool to switch status on device.');
            var path = 'tdtool';
        } 
        exec('"'+path+'" --version', null, function (error,stdout,stderr) {
            var lines = stdout.toString().split('\n');
            var version = lines[0].substr(lines[0].indexOf(' ')+1);
            
            if (compareversion(version,variables.tdtoolversionlimit) >= 0) {
                console.log('New Version of Telldus. >= ' + variables.tdtoolversionlimit);
                exec('"'+path+'" --list-devices', null, function (error,stdout,stderr) {
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
                            variables.devices.push(currentdevice);
                        }
                    });
                    variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
                    callback();
                });
            } else {
                console.log('Old Version of Telldus. < ' + variables.tdtoolversionlimit);
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
                                variables.devices.push(currentdevice);
                            }                   
                            
                        }
                    });
                    variables.devices.sort(sharedfunctions.dynamicSortMultiple('name'));
                    callback();
                });
            }
            
        });
       
    },
    
    function (callback) {
        var schedulesarray = [];
        // get the list of schedules from the file
        var sourcefolder = __dirname.replace("\\","/");
    
        // Perhaps limit this to start of application. Then work with schedules stored in memory. Only work with files when removing or adding new schedules.
        fs.exists(__dirname + '/userdata/schedules.db.js', function (exists) {
            if(exists) {
                fs.readFile(sourcefolder + '/userdata/schedules.db.js',{'encoding':'utf8'},function(err,data) {
                //console.log(err);
                    //console.log('Reading the scheduledatabase');
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
        // Highlight the active / last active schedule
        var currenttimestamp = new Date();
        var today = currenttimestamp.getUTCDay();

        var hour = '0' + currenttimestamp.getHours();
        var minutes = '0' + currenttimestamp.getMinutes();
        hour = hour.substr(hour.length-2);
        minutes = minutes.substr(minutes.length-2);
        var currenttime = hour + ":" + minutes;


        //console.log('Inside Resetstatusfunction();');
        variables.devices.forEach(function(device) {

            var startday = today+1;
            var todayreached = false;
            if (today == 6) {
                startday = 0;
            }

            // For EACH device
            var daysoftheweek = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
            // Store each schedule in the right day of the week
            device.schedule.forEach(function (schedule) {
                schedule.dayofweek.forEach( function (day) {
                    if (schedule.controller != 'Timer') {
                        daysoftheweek[day].push(schedule);
                    }
                });
            });

            // Sort the times for each day so they are in the right order
            for (var key in daysoftheweek) {
                if (daysoftheweek.hasOwnProperty(key)) {
                    var day = daysoftheweek[key];
                    if(day.length > 0) {
                        day.sort(sharedfunctions.dynamicSortMultiple('time'));
                    }
                }
            }

            var schedulefound = false;

            do {
                // check if we are on 'today'
                if (startday == today) {
                    todayreached = true;
                }
                
                var day = daysoftheweek[startday];
                for (var i = 0; i < day.length; i++) {

                    if (todayreached) {

                        if (currenttime > day[i].time) {
                            device.activescheduleid = day[i].uniqueid;
                            device.currentstatus = day[i].action;
                            device.activeday = startday;
                        } else {
                            break;
                        }
                    } else {
                            device.activescheduleid = day[i].uniqueid;
                            device.currentstatus = day[i].action;
                            device.activeday = startday;
                    }
                };

                if (startday == 6) {
                    startday = 0;
                } else {
                    startday++;
                }

            } while (todayreached == false);
            
        });
        callback();
    },
    function (callback) {
        // Reset devices to correct status
        /*
        variables.devices.forEach(function(device) {
            
            if (device.activescheduleid.toString().length > 0) {
                console.log('Resetting "' + device.name + '" to ' + device.currentstatus + ' as stated by schedule with id: ' + device.activescheduleid);
                sharedfunctions.log('Startup - Resetting "' + device.name + '" to ' + device.currentstatus + ' as stated by schedule with id: ' + device.activescheduleid);
                devicefunctions.deviceaction(device.id, device.currentstatus);
                // Perhaps add DoubleTap here..
            } else {
                console.log('Found no schedules for ' + device.id + ":" +  device.name);
            }
        });
        callback();
        */
        devicefunctions.resetdevices(callback);
    },
    function (callback) {
        // Fetch the watchers and apply them to the correct device  
        var watchersarray = [];
        // get the list of schedules from the file
        var sourcefolder = __dirname.replace("\\","/");
    
        // Perhaps limit this to start of application. Then work with schedules stored in memory. Only work with files when removing or adding new schedules.
        fs.exists(__dirname + '/userdata/watchers.db.js', function (exists) {
            if(exists) {
                fs.readFile(sourcefolder + '/userdata/watchers.db.js',{'encoding':'utf8'},function(err,data) {
                //console.log(err);
                    //console.log('Reading the scheduledatabase');
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
                    //console.log(variables.devices);
                    callback();
                });
                
            } else {
                callback();
            }
        });
    }
    
],function (err) {
    // Start the server here
    variables.savetofile = true;
    var server = app.listen(variables.options.port,function() {
      var host = server.address().address
      var port = server.address().port
      console.log('TellstickNode.js started listening at http://%s:%s', host, port)
      sharedfunctions.log('Startup - Server startup process finished. Now listening to requests on HTTP.');
    });
    
    io.listen(server);
    
    io.sockets.on('connection', function(socket){
    socket.on('request_sun_time', function(data){
        var sunmovement = new Date(variables.weather.sys[data.controller]*1000);
        var hour = '0' + sunmovement.getHours();
        var minutes = '0' + sunmovement.getMinutes();
        hour = hour.substr(hour.length-2);
        minutes = minutes.substr(minutes.length-2);
        sendtoclient([{device: 'Time:'+ hour + ":" + minutes}]);
      });
    });
 
    //heapdump.writeSnapshot(__dirname.replace("\\","/") + '/' + Date.now() + '.heapsnapshot');
	var timerstart = new Date();
	setTimeout(timer_getdevicestatus,15000);
    setTimeout(doubletapcheck,1000*variables.options.doubletapseconds);
	setTimeout(minutecheck,60000,timerstart);
	//setTimeout(timer_getweather,60000);
});

function timer_getdevicestatus() {
	var timestamp_start = new Date();
		
    //if (variables.doubletap.length > 0) {
    //    console.log('There is something in doubletap. Waiting to update device info untill all commands are sent.');  
    //    setTimeout(timer_getdevicestatus,(15000+(timestamp_start-new Date().getTime())));
    //} else {

        if (os.platform() === 'win32') {
            //console.log('Server is a Windows machine. Run tdtool.exe to fetch a list of devices.');
            var sourcefolder = __dirname.replace(/\\/g,"/");
            var path =  sourcefolder + '/requirements/tdtool.exe';
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
                    sendtoclient(devicejson);     
                    setTimeout(timer_getdevicestatus,(15000+(timestamp_start-new Date().getTime())));
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
                                        
                                        // INSERT WATCHER HERE...
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
                    sendtoclient(devicejson);     
                    setTimeout(timer_getdevicestatus,(15000+(timestamp_start-new Date().getTime())));
                });
            }
        });
    //}
}

 // Doubletap interval check
function doubletapcheck() {
	var timestamp_start = new Date();
	variables.doubletap.forEach(function(repeatschedule) {
		if(repeatschedule.count > 0) {
			// DEBUG
			var debugtimestamp = new Date();
			//console.log(debugtimestamp.getHours() + ":" + debugtimestamp.getMinutes() + ":" + debugtimestamp.getSeconds());
			// END OF DEBUG
			devicefunctions.deviceaction(repeatschedule.schedule.deviceid,repeatschedule.action);
			repeatschedule.count = repeatschedule.count-1;
		}
	});
	 for (var i=0; i<variables.doubletap.length; i++) {
		if (variables.doubletap[i].count < 1) {
			variables.doubletap.splice(i,1);
			i = 0;
		}
	}
	if (variables.options.doubletapseconds < 1) {
		variables.options.doubletapseconds = 1;
	}
	// (60000+(timestamp_start-new Date().getTime()))
   setTimeout(doubletapcheck,((1000*variables.options.doubletapseconds)+(timestamp_start-new Date().getTime())));
}

//// implement timestamp argument!!!!! Solves it??
function minutecheck (timestamp_start) {
    sharedfunctions.DateAdd('n',timestamp_start,1);
    console.log('_________________________________________________________________');
	//var timestamp_start = new Date();
	//timestamp_start.setSeconds(0);
    //timestamp_start.setMilliseconds(0);
	

	var hour = '0' + timestamp_start.getHours();
	var minutes = '0' + timestamp_start.getMinutes();
    var seconds = '0' + timestamp_start.getSeconds();
	hour = hour.substr(hour.length-2);
	minutes = minutes.substr(minutes.length-2);
    seconds = seconds.substr(seconds.length-2);
	console.log('Start of Minutescheck: ' + hour +':'+ minutes + ':' + seconds + ":" + timestamp_start.getMilliseconds());
	
	var dayofweek = timestamp_start.getUTCDay();
	var removeschedules = [];
	variables.devices.forEach(function(device) {

		device.schedule.forEach(function (schedule) {

			schedule.dayofweek.forEach(function (day) {
				if (day == dayofweek) {
					if (schedule.time == hour + ':' + minutes) {
                        if (variables.pauseschedules) {
                            console.log('Device: ' + device.id + ' | Scheduled for an event TODAY and NOW. This has not been executed as schedules are paused.');
                            sharedfunctions.log('Schedule [' + schedule.uniqueid + '] for device ['+device.name+'] triggered. This has not been executed as schedules are paused.'); 
                        } else {
                            if (schedule.enabled == 'true') {
                                var runschedule = true;
                                
                                if (schedule.intervalnotbefore.indexOf(':') != -1) {
                                    var notbefore = new Date();
                                    notbeforearray = schedule.intervalnotbefore.split(':');
                                    notbefore.setHours(notbeforearray[0]);
                                    notbefore.setMinutes(notbeforearray[1]); 
                                    var minutedifference_notbefore = Math.floor(((timestamp_start - notbefore)/1000)/60);
                                    if (minutedifference_notbefore < 0) {
                                        // if less than 0, don't run the schedule! // This means that the before time has not yet been reached.
                                        runschedule = false;
                                    }
                                }
                                
                                if (schedule.intervalnotafter.indexOf(':') != -1) {
                                    var notafter = new Date();
                                    notafterearray = schedule.intervalnotafter.split(':');
                                    notafter.setHours(notafterearray[0]);
                                    notafter.setMinutes(notafterearray[1]); 
                                    var minutedifference_notafter = Math.floor(((timestamp_start - notafter)/1000)/60);
                                    if (minutedifference_notafter > 0) {
                                        // if more than 0, don't run the schedule! | This means that the after time has already passes.
                                        runschedule = false;
                                    }
                                }
                                
                                
                                
                                //sharedfunctions.log('notbefore difference: ' + minutedifference_notbefore); // Run schedule if notbefore is above 0
                                //sharedfunctions.log('notafter difference: ' + minutedifference_notafter); // Run schedule if notafter is below 0
                                
                                
                                if (runschedule) {
                                    console.log('Device: ' + device.id + ' | Scheduled for an event TODAY and NOW');
                                    sharedfunctions.log('Schedule [' + schedule.uniqueid + '] for device ['+device.name+'] triggered.');
                                    devicefunctions.deviceaction(device.id,schedule.action);
                                    if (schedule.sendautoremote == 'true') {
                                        sharedfunctions.autoremote(device.name,schedule.action);
                                    }
                                    if ( (schedule.runonce == 'true') && (schedule.controller != 'Timer') ) {
                                        removeschedules.push(schedule.uniqueid);
                                    }
                                    sendtoclient([{device :  device.id+':'+schedule.uniqueid}])
                                    schedule.stage = 1;
                                    // Check if doubletap is configured. If so, add this schedule to the doubletap array with a counter
                                    if (variables.options.doubletapcount > 0) {
                                        variables.doubletap.push({schedule : schedule,count : variables.options.doubletapcount, action: schedule.action});
                                    }
                                } else {
                                    sharedfunctions.log('Schedule [' + schedule.uniqueid + '] for device ['+device.name+'] not triggered. Out of allowed intervall.'); 
                                }
                            } else {
                                console.log('Device: ' + device.id + ' | Scheduled for an event TODAY and NOW (Schedule disabled)');
                                sharedfunctions.log('Schedule [' + schedule.uniqueid + '] for device ['+device.name+'] did not trigger now because the schedule is disabled.');  
                            }
                        }
					}
					
					if (schedule.controller == 'Timer') {
					   
						// Not yet tested. newschedule are not sorted for this yet.
						var timerdate = new Date();

						timearray = schedule.time.split(':');
						timerdate.setHours(timearray[0]);
						timerdate.setMinutes(timearray[1]); 
						//console.log(timerdate);
						sharedfunctions.DateAdd('n',timerdate,Number(schedule.duration));
						
						
						var timerhour = '0' + timerdate.getHours();
						var timerminutes = '0' + timerdate.getMinutes();
						timerhour = timerhour.substr(timerhour.length-2);
						timerminutes = timerminutes.substr(timerminutes.length-2);
						var timertime = timerhour + ":" + timerminutes;
						
						//console.log('id ' + schedule.uniqueid + ' [' + schedule.time + " ] " + timertime  +' == '+ hour + ':' + minutes + ' and schedule.stage == ' + schedule.stage);
						if ( (timertime  == hour + ':' + minutes) && (schedule.stage == 1) ) {
							if (variables.pauseschedules) {
                                console.log('Timer off event for "' + device.name + '" has not been executed as schedules are paused.');
                                sharedfunctions.log('Timer off event for "' + device.name + '" has not been executed as schedules are paused.');  
                            } else {
                                devicefunctions.deviceaction(device.id,'off');
                                
                                if (schedule.sendautoremote == 'true') {
                                    sharedfunctions.autoremote(device.name,'off');
                                }
                                
                                schedule.stage = 2;
                                if (schedule.runonce == 'true') {
                                    removeschedules.push(schedule.uniqueid);
                                }
                                sendtoclient([{device :  device.id+':'+schedule.uniqueid}])

                                // Check if doubletap is configured. If so, add this schedule to the doubletap array with a counter
                                if (variables.options.doubletapcount > 0) {
                                    doubletap.push({schedule : schedule,count : variables.options.doubletapcount, action: 'off'});
                                }    
                            }
						}
					}
				}
			});                
		});                    
	});
	
	// Remove any runonce schedules that has been executed
	//schedulefunctions.removeschedule(removeschedules); 
	variables.devices.forEach( function(device) {
		for (var i = 0; i < device.schedule.length; i++) {
			removeschedules.forEach(function(scheduletoremove) {
				//console.log(scheduletoremove + "==" + device.schedule[i].uniqueid);
				if(scheduletoremove == device.schedule[i].uniqueid) {
					variables.savetofile = true;
					console.log('RunOnce schedule ' + device.schedule[i].uniqueid + ' was removed.');
					device.schedule.splice(i,1);
					i=0;
				}
			});
		}

	});
	
	if(variables.savetofile) {
		console.log('Saving all schedules to the file');
        sharedfunctions.log('Saving all schedules to file.');
		var sourcefolder = __dirname.replace("\\","/");
		fs.unlink(sourcefolder + '/userdata/schedules.db.js', function() {  
			variables.devices.forEach(function (device) {
				device.schedule.forEach( function(schedule) {
					fs.appendFile(sourcefolder + '/userdata/schedules.db.js',JSON.stringify(schedule)+'\n', function() {
						console.log('Saved Schedule to file with id: ' + schedule.uniqueid);
					});    
				});
			});
		});
        
        fs.unlink(sourcefolder + '/userdata/watchers.db.js', function() {  
			variables.devices.forEach(function (device) {
				device.watchers.forEach( function(watcher) {
					fs.appendFile(sourcefolder + '/userdata/watchers.db.js',JSON.stringify(watcher)+'\n', function() {
						console.log('Saved Watcher to file with id: ' + watcher.uniqueid);
					});    
				});
			});
		});
        
		variables.savetofile = false;
	} 
	
	var difference_milliseconds_recalculate = timestamp_start - lasttimestamp_recalculate;
    var difference_minutes_recalculate = Math.floor((difference_milliseconds_recalculate/1000)/60);
	console.log('Difference minues recaluclate: ' + difference_minutes_recalculate);
    var weatherfetched = false;
	if (difference_minutes_recalculate == 30) {
        lasttimestamp_recalculate = timestamp_start;
        console.log('latstimestamp hour and minutes:' + lasttimestamp_recalculate.getHours() + ":" + lasttimestamp_recalculate.getMinutes()+ ":" + lasttimestamp_recalculate.getSeconds());
        //lasttimestamp_recalculate.setMinutes(lasttimestamp_recalculate.getMinutes()-difference_minutes_recalculate);
		async.series([
			function (callback) {
				if (variables.options.city.toString().length > 0) {
					//weather.setCity(encodeURIComponent(variables.options.city));
					dns.lookup('api.openweathermap.org',function onLookup (err) {
						if (err) { 
							console.log('Unable to reach api.openweathermap.org');
							callback();
						} else {
							
							//var http = require('http');						  
							var options = {
								host : 'api.openweathermap.org',
								path: '/data/2.5/weather?q=' + encodeURIComponent(variables.options.city) + '&units=metric&lang=en'
							};
							
							var weatherreq = http.get(options, function(res){
								//console.log(res);
								res.setEncoding('utf-8');
								console.log(res.statusCode);
								  
								if (res.statusCode == 200) {
									res.on('data', function (chunk) {
									var parsed = {};
									  
									try {				
										console.log('Fetched new weatherinfo.');
										variables.weather = JSON.parse(chunk)
									} catch (e) {
										console.log('Error with fetching the weather. Openweathermap.org might be busy or something.');
									}
                                        
                                    if (weatherfetched == false) {
                                        weatherfetched = true;
									   callback(null, 'original'); 
                                    } else {
                                        callback(null, 'dublicate'); 
                                    }
								  });
                                    res.on('error', function (chunk) {
                                        // Error
                                    });
								} else {
									console.log('openweather: error. Received wrong statuscode');
									if (weatherfetched == false) {
                                        weatherfetched = true;
									   callback(null, 'original'); 
                                    } else {
                                        callback(null, 'dublicate'); 
                                    }
								}
                                
                                res.on('error', function (chunk) {
                                        // Error
                                });
								
							}); 
                            
						}
					});
				} else {
					console.log('No city defined. Unable to fetch info.');
                    sharedfunctions.log('No city provided in Options. Unable to fetch weather info.');
					callback();
				}
			}
		],function(err, result) {
            //console.log('Result: ' + weatherfetched);
			// For each device
			console.log('Recalculating schedules trigger time.');
            sharedfunctions.log('Recalculating schedules');
			
			if (typeof(variables.weather.weather) != 'undefined') {
				var sunrise = new Date(variables.weather.sys.sunrise*1000); 
				var sunset = new Date(variables.weather.sys.sunset*1000);
                
                var hour = '0' + sunset.getHours();
                var minutes = '0' + sunset.getMinutes();
                sunset = hour.substr(hour.length-2) + ":" + minutes.substr(minutes.length-2);
                
                var hour = '0' + sunrise.getHours();
                var minutes = '0' + sunrise.getMinutes();
                sunrise = hour.substr(hour.length-2) + ":" + minutes.substr(minutes.length-2);
                
			}
			
			variables.devices.forEach(function (device) {
				
				// For each schedule
				device.schedule.forEach( function (schedule) {
                    if (variables.debug == 'true') {
                        sharedfunctions.log('['+schedule.uniqueid+']Before recalculate: ' + schedule.time);
                    }
					
					// First we check if the controller is sun-based and define a new ORIGINAL TIME based on that.

                    if (schedule.controller == 'Sundown') {
                        if (typeof(variables.weather.weather) != 'undefined') {
                            //var hour = '0' + sunset.getHours();
                            //var minutes = '0' + sunset.getMinutes();
                            //hour = hour.substr(hour.length-2);
                            //minutes = minutes.substr(minutes.length-2);
                            schedule.originaltime = sunset;   
                            variables.savetofile = true;
                            console.log('['+schedule.uniqueid+']Set a new original time on schedule based on sunset time: ' + schedule.originaltime);
                        } else {
                            console.log('['+schedule.uniqueid+']Failed to update schedules time based on sun-movement due to no weather information available.');
                        }
                    }

                    if (schedule.controller == 'Sunrise') {
                        if (typeof(variables.weather.weather) != 'undefined') {
                            //var hour = '0' + sunrise.getHours();
                            //var minutes = '0' + sunrise.getMinutes();
                            //hour = hour.substr(hour.length-2);
                            //minutes = minutes.substr(minutes.length-2);
                            schedule.originaltime = sunrise;  
                            variables.savetofile = true;
                            console.log('['+schedule.uniqueid+']Set a new original time on schedule based on sunrise time: ' + schedule.originaltime);
                        } else {
                            console.log('['+schedule.uniqueid+']Failed to update schedules time based on sun-movement due to no weather information available.');
                        }
                    }
                    
                    if (schedule.intervalnotbeforecontroller == 'Sundown') {
                         if (typeof(variables.weather.weather) != 'undefined') {
                            //var hour = '0' + sunrise.getHours();
                            //var minutes = '0' + sunrise.getMinutes();
                            schedule.intervalnotbefore = sunset;
                            variables.savetofile = true;
                        }
                    }
                    
                    if (schedule.intervalnotbeforecontroller == 'Sunrise') {
                         if (typeof(variables.weather.weather) != 'undefined') {
                            //var hour = '0' + sunrise.getHours();
                            //var minutes = '0' + sunrise.getMinutes();
                            schedule.intervalnotbefore = sunrise;
                            variables.savetofile = true;
                        }
                    }
                    
                    if (schedule.intervalnotaftercontroller == 'Sundown') {
                        if (typeof(variables.weather.weather) != 'undefined') {
                            //var hour = '0' + sunrise.getHours();
                            //var minutes = '0' + sunrise.getMinutes();
                            schedule.intervalnotafter = sunset;
                            variables.savetofile = true;                            
                        }
                    }
                    
                    if (schedule.intervalnotaftercontroller == 'Sunrise') {
                        if (typeof(variables.weather.weather) != 'undefined') {
                            //var hour = '0' + sunrise.getHours();
                            //var minutes = '0' + sunrise.getMinutes();
                            schedule.intervalnotafter = sunrise;
                            variables.savetofile = true;
                        }
                    }
					
					var original = new Date();
					timearray = schedule.originaltime.split(':');
					original.setHours(timearray[0]);
					original.setMinutes(timearray[1]);  

					if (typeof(variables.weather.weather) != 'undefined') {
						
						if (variables.options.weathercodes.indexOf(variables.weather.weather[0].id) != -1) {
							// Weather ID found in the approved codes
							// Good weather ( n = minutes )
							sharedfunctions.DateAdd('n',original,Number(schedule.weathergoodfunction + schedule.weathergoodtime));
							
						} else {
							// Bad weather ( n = minutes )
							sharedfunctions.DateAdd('n',original,Number(schedule.weatherbadfunction + schedule.weatherbadtime));
						}                            
					}
					
					var randomfunction = schedule.randomizerfunction;
					if (schedule.randomizerfunction == 'both') {
							var randomvaluefloored = Math.round(Math.random());
								randomfunction = randomvaluefloored;
								if (randomfunction == 0) {
									randomfunction = '+';
								} else {
									randomfunction = '-';
								}
					}
					
					randomfunction += Math.round(Math.random() * schedule.randomiser);
				    
                    var difference_minutes_recalculate_compare = Math.floor(((original - timestamp_start)/1000)/60);
                    
                    if (variables.debug == 'true') {                   
                        sharedfunctions.log('['+schedule.uniqueid+']Original Time compared to now: (>0 is in the past, <0 is in the future.) ' + difference_minutes_recalculate_compare);

                    }
                    
                    
                    if  ( (difference_minutes_recalculate_compare > -5) && (difference_minutes_recalculate_compare < 5)  ) {
                        // If the schedule is set to orignally occur within +/- 5 minutes from NOW, we won't update it.
                        //console.log('The Schedule is to be triggered either 5 minuters in the past or 5 minutes in the future. I won\'t update the time');
                    } else {
                        // If the schedule is set to occur earier or later than +/- 5 minutes from NOW, we can add the randomizer.
                        sharedfunctions.DateAdd('n',original,Number(randomfunction));
                        
                        var difference_minutes_recalculate_compare = Math.floor(((original - timestamp_start)/1000)/60);
                        if  ( (difference_minutes_recalculate_compare > -5) && (difference_minutes_recalculate_compare < 5)  ) {
                            // If the recalculated time is set to occur within +/- 5 minutes from NOW, we won't update it.
                            //console.log('The Schedules new time is to be triggered either 5 minuters in the past or 5 minutes in the future. I won\'t update the time');
                        } else {
                            // If the recalculated time is set to occur earlier or later than +/- 5 minutes from now, we can update the schedule with the new time.
                            //console.log('The schedule is going to be updated.');
                            var hour = '0' + original.getHours();
							var minutes = '0' + original.getMinutes();
							hour = hour.substr(hour.length-2);
							minutes = minutes.substr(minutes.length-2);
                            
                            if (variables.debug == 'true') {
                                sharedfunctions.log('['+schedule.uniqueid+']After recalculate the new time is: ' + hour + ":" + minutes);
                                sharedfunctions.log('['+schedule.uniqueid+']Recalculated Time compared to now: (>0 is in the past, <0 is in the future.) ' + difference_minutes_recalculate_compare);
                            }
                            
							schedule.time = hour + ":" + minutes;
							variables.savetofile = true;
                        }
                    }
                    
				});
		   });
            
            var timestamp_end = new Date();
            var hour = '0' + timestamp_end.getHours();
            var minutes = '0' + timestamp_end.getMinutes();
            var seconds = '0' + timestamp_end.getSeconds();
            hour = hour.substr(hour.length-2);
            minutes = minutes.substr(minutes.length-2);
            seconds = seconds.substr(seconds.length-2);
            
            //console.log('[recalculate] End of Minutescheck inside recalculate: ' + hour +':'+ minutes + ':' + seconds + ":" + timestamp_end.getMilliseconds());
            var enddifference = timestamp_end-timestamp_start;
            //console.log('enddifference: ' + enddifference);
            //console.log('[recalculate] Milliseconds untill next launch: ' + (60000-enddifference));
            timestamp_end.setMilliseconds(timestamp_end.getMilliseconds()-enddifference);
            //console.log('[recalculate] End of Minutescheck inside recalculate: (after modification) ' + hour +':'+ minutes + ':' + seconds + ":" + timestamp_end.getMilliseconds());
		   setTimeout(minutecheck,(60000-enddifference),timestamp_end);
		});
	} else {
        var timestamp_end = new Date();
        var hour = '0' + timestamp_end.getHours();
        var minutes = '0' + timestamp_end.getMinutes();
        var seconds = '0' + timestamp_end.getSeconds();
        hour = hour.substr(hour.length-2);
        minutes = minutes.substr(minutes.length-2);
        seconds = seconds.substr(seconds.length-2);        
        
        //console.log('End of Minutescheck inside recalculate: ' + hour +':'+ minutes + ':' + seconds + ":" + timestamp_end.getMilliseconds());
        var enddifference = timestamp_end-timestamp_start;
        //console.log('enddifference: ' + enddifference);
        //console.log('Milliseconds untill next launch: ' + (60000-enddifference));
        timestamp_end.setMilliseconds(timestamp_end.getMilliseconds()-enddifference);
        //console.log('End of Minutescheck inside recalculate: (after modification) ' + hour +':'+ minutes + ':' + seconds + ":" + timestamp_end.getMilliseconds());
		setTimeout(minutecheck,(60000-enddifference),timestamp_end);
	}
};

// Function to send a message to all connected browsers
function sendtoclient (message) {
    io.sockets.emit('message', {'message': message});
    //console.log('test');
}
exports.sendtoclient = sendtoclient;