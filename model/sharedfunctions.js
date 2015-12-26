var variables = require('./variables');
var http = require('http');	
var dns = require('dns');

function DateAdd (ItemType, DateToWorkOn, ValueToBeAdded) {
			switch (ItemType)
			{
				//date portion         
				case 'd': //add days
					DateToWorkOn.setDate(DateToWorkOn.getDate() + ValueToBeAdded)
					break;
				case 'm': //add months
					DateToWorkOn.setMonth(DateToWorkOn.getMonth() + ValueToBeAdded)
					break;
				case 'y': //add years
					DateToWorkOn.setYear(DateToWorkOn.getFullYear() + ValueToBeAdded)
					break;
				//time portion         
				case 'h': //add days
					DateToWorkOn.setHours(DateToWorkOn.getHours() + ValueToBeAdded)
					break;
				case 'n': //add minutes
					DateToWorkOn.setMinutes(DateToWorkOn.getMinutes() + ValueToBeAdded)
					break;
				case 's': //add seconds
					DateToWorkOn.setSeconds(DateToWorkOn.getSeconds() + ValueToBeAdded)
					break;
			}
			return DateToWorkOn;
		}
		
		
function dynamicSortMultiple() {
			/*
		 * save the arguments object as it will be overwritten
		 * note that arguments object is an array-like object
		 * consisting of the names of the properties to sort by
		 */
		var props = arguments;
		return function (obj1, obj2) {
			var i = 0, result = 0, numberOfProperties = props.length;
			/* try getting a different result from 0 (equal)
			 * as long as we have extra properties to compare
			 */
			while(result === 0 && i < numberOfProperties) {
				result = dynamicSort(props[i])(obj1, obj2);
				i++;
			}
			return result;
		}
	}
	
	
function dynamicSort (property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}	

function log (message) {
	
    var maxlog = 300;
    if (variables.debug == 'true') {
     maxlog = 3000;   
    }

    while (variables.log.length > maxlog) {
            variables.log.shift();   
    }
    
	var timestamp_start = new Date();
	var hour = '0' + timestamp_start.getHours();
	var minutes = '0' + timestamp_start.getMinutes();
	var seconds = '0' + timestamp_start.getSeconds();
    
	hour = hour.substr(hour.length-2);
	minutes = minutes.substr(minutes.length-2);
	seconds = seconds.substr(seconds.length-2);
    
    console.log('UserLog:' + hour + ':' + minutes + ':' + seconds + ":" + message)
    variables.log.push({time: hour + ':' + minutes + ':' + seconds,message: message});
}

function logToFile (message, targetfile) {
    var fs = require('fs');
    var os = require("os");
    var fsextra = require('fs-extra');
    
     var timestamp_start = new Date();
	var hour = '0' + timestamp_start.getHours();
	var minutes = '0' + timestamp_start.getMinutes();
	var seconds = '0' + timestamp_start.getSeconds();
    var milliseconds = '00' + timestamp_start.getMilliseconds();
	hour = hour.substr(hour.length-2);
	minutes = minutes.substr(minutes.length-2);
	seconds = seconds.substr(seconds.length-2);
    milliseconds = milliseconds.substr(milliseconds.length-3);
    
    
    var month = (Number(("0" + timestamp_start.getUTCMonth()).substr((("0" + timestamp_start.getUTCMonth()).length)-2))+1);
    var day = ("0" + timestamp_start.getUTCDate()).substr((("0" + timestamp_start.getUTCDate()).length)-2);
    var year = timestamp_start.getUTCFullYear();
    
    
    

    var logdir = variables.rootdir + '/logs/';
    // Create the directory if it dosn't exist.
    fsextra.mkdirsSync(logdir);
    
    
    
    var logdircontents = fs.readdirSync(variables.rootdir + '/logs');
    
    
    // Sort the directory of backups so we don't remove anything we shoudln't.
    logdircontents.sort(function(a, b) {
            return a < b ? -1 : 1;
    })

    // If there is not a folder for todays logfiles, create one. Also, make sure there is only 7 folders in total after that.
    if (logdircontents.indexOf( year.toString() + month.toString() +day.toString()) == -1) {
            while(logdircontents.length > 6) {
                var oldest = logdircontents.shift();
                var logdata = fs.readdirSync(logdir+ oldest);
                logdata.forEach(function(filename) {
                    fs.unlinkSync(logdir + oldest + '/' + filename);
                });
                fs.rmdirSync(logdir + oldest);
            }
            //logdircontents.forEach(function(file, key) {
            //    sharedfunctions.logToFile('Log,' + file,'Core');
            //});
            fs.mkdirSync(logdir + year.toString() + month.toString() +day.toString());
    }
  
    targetfile = targetfile + '.log'
    
    var filemessage = hour + ':' + minutes + ':' + seconds + ':' + milliseconds + ',' + message;

    console.log("[" + targetfile + "]" + filemessage);
    fs.appendFileSync(logdir + year.toString() + month.toString() +day.toString() + '/' + targetfile, filemessage + os.EOL);

}

function autoremote (devicename, action) {
    //http://autoremotejoaomgcd.appspot.com/sendmessage?key=YOUR_KEY&message=hi
    
    var message = variables.options.autoremote_message;
    message = message.replace(/{device-name}/g,devicename);
    message = message.replace(/{device-lastcommand}/g,action);
    if ( (variables.options.autoremote_password.length === 0) || (variables.options.autoremote_key.length === 0) ) {
            logToFile('AutoRemote,Unable to send AutoRemote messages. Not configured.','Core');
			return;
		}
	
    dns.lookup('autoremotejoaomgcd.appspot.com',function onLookup (err) {
						if (err) { 
                            logToFile('AutoRemote,Unable to reach autoremotejoaomgcd.appspot.com','Client');
						} else {
							//var http = require('http');						  
							var options = {
								host : 'autoremotejoaomgcd.appspot.com',
								path: 'http://autoremotejoaomgcd.appspot.com/sendmessage?message=' + encodeURIComponent(message) + '&password=' + variables.options.autoremote_password + '&key=' + encodeURIComponent(variables.options.autoremote_key)
							};
							
							var weatherreq = http.get(options, function(res){
								//console.log(res);
								res.setEncoding('utf-8');
								//console.log(res.statusCode);
								  
								if (res.statusCode == 200) {
									logToFile('AutoRemote,Message has been sent to AutoRemote: ' + message,'Client');
									res.on('error', function (chunk) {
											// Error
									});
								} else {
									logToFile('AutoRemote,Received wrong statuscode: ' + res.statusCode,'Client');
								}
                                
								res.on('error', function (chunk) {
												// Error
								});
								
							}); 
                            
						}
					});
}

function createdropdown(max, intervall, selecteditem) {
    var dropdown = '<option value="0">0';
    for (var i = 1; i<=Math.floor(max/intervall); i++) {
        var selected = '';
        if (selecteditem == (i*intervall)) {
            selected = 'selected';
        }
        dropdown += '<option ' + selected + ' value="'+(i*intervall)+'">'+(i*intervall);

    }
    return dropdown;
}

function createdropdown_alphanumeric(options,selecteditem) {
    // Generate dropdown options with the value and display from 'options[[value,displayname]]'
    // Displayname is optional as a second paremeter to the array. If not present, value will be displayed.
    var dropdown = '';
    options.forEach(function(option) {
        var selected = '';
        if (selecteditem.toLowerCase() == option[0].toLowerCase()) {
            selected = 'selected';
        }
        
        var displayname = option[0];
        if (typeof(option[1]) != 'undefined') {
            displayname = option[1];
        }
        
        dropdown += '<option {'+option[0]+'} ' + selected + ' value="'+option[0]+'">'+displayname;
    });
    return dropdown;
}


exports.autoremote = autoremote;
exports.DateAdd = DateAdd;
exports.dynamicSortMultiple = dynamicSortMultiple;
exports.dynamicSort = dynamicSort;
exports.log = log;
exports.createdropdown = createdropdown;
exports.createdropdown_alphanumeric = createdropdown_alphanumeric;
exports.logToFile = logToFile;