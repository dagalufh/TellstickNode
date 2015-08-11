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
     maxlog = 1000;   
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
    
    variables.log.push({time: hour + ':' + minutes + ':' + seconds,message: message});
}

function autoremote (devicename, action) {
    //http://autoremotejoaomgcd.appspot.com/sendmessage?key=YOUR_KEY&message=hi
    
    var message = variables.options.autoremote_message;
    message = message.replace(/{device-name}/g,devicename);
    message = message.replace(/{device-lastcommand}/g,action);
    
    dns.lookup('autoremotejoaomgcd.appspot.com',function onLookup (err) {
						if (err) { 
							console.log('Unable to reach autoremotejoaomgcd.appspot.com');
						} else {
							//var http = require('http');						  
							var options = {
								host : 'autoremotejoaomgcd.appspot.com',
								path: 'http://autoremotejoaomgcd.appspot.com/sendmessage?message=' + encodeURIComponent(message) + '&password=' + variables.options.autoremote_password + '&key=' + variables.options.autoremote_key
							};
							
							var weatherreq = http.get(options, function(res){
								//console.log(res);
								res.setEncoding('utf-8');
								//console.log(res.statusCode);
								  
								if (res.statusCode == 200) {
									console.log('Sent message to AutoRemote.');
                                    res.on('error', function (chunk) {
                                        // Error
                                    });
								} else {
									console.log('autoremote: error. Received wrong statuscode');
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