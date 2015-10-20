// Include the template view (Do all the presentation(?))
var template = require('../views/template-main').build;
var variables = require('../model/variables');
var sharedfunctions = require('../model/sharedfunctions');

// Include the functions for handling files
var fs = require('fs');

function get(req,res) {
    // Save via socket.io call, this means we can toss back a reply that it's done. Or not needed.. res.send('Complete') will suffice.
    var headline = 'Options';
    var body = ['<div class="panel panel-default">',
                        '<div class="panel-body">',
                            '<div class="form-group">',
                                '<label for="Select_Theme">Theme:</label>',
                                '<select id="Select_Theme" class="form-control">',
                                    '{selecttheme}',
                                '</select>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="city">City:</label>',
                                '<input type="text" class="form-control" id="city" placeholder="City" value="{city}">',
                                '<p class="text-info">Enter it without any special characters, english characters only.</p>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="appid">OpenWeatherMap APPID:</label>',
                                '<input type="text" class="form-control" id="appid" placeholder="AppID" value="{appid}">',
                                '<p class="text-info">Register at <a href="http://home.openweathermap.org/users/sign_in">OpenWeatherMap.org</a> to get a AppID. It\'s free for small use.</p>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="port">Port:</label>',
                                '<input type="text" class="form-control" id="port" placeholder="Port" value="{port}">',
                                '<p class="text-info">Requires restart of server to take effect.</p>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="doubletapcount">Repeat each schedulecommand x number of times:</label>',
                                '<input type="text" class="form-control" id="doubletapcount" placeholder="Repeat x times" value="{doubletapcount}">',
                                '<p class="text-info">Send the command to the device for the schedule multiple times to ensure it gets received.</p>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="doubletapseconds">Repeat each schedulecommand x seconds appart:</label>',
                                '<input type="text" class="form-control" id="doubletapseconds" placeholder="Seconds" value="{doubletapseconds}">',
                                '<p class="text-info">This controlls how many seconds appart the commands are sent.</p>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="weathercodes">Good weather codes:</label>',
                                '<input type="text" class="form-control" id="weathercodes" placeholder="Weather Codes" value="{weathercodes}">',
                                '<p class="text-info">Seperate the weather codes using , (colon). You can find the weather codes <a href="http://openweathermap.org/weather-conditions">here</a></p>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="autoremote_key">AutoRemote Key:</label>',
                                '<input type="text" class="form-control" id="autoremote_key" placeholder="AutoRemote Key" value="{autoremote_key}">',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="autoremote_password">AutoRemote Password:</label>',
                                '<input type="text" class="form-control" id="autoremote_password" placeholder="AutoRemote Password" value="{autoremote_password}">',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="autoremote_message">AutoRemote Message:</label>',
                                '<input type="text" class="form-control" id="autoremote_message" placeholder="Device {device-id} was set to {device-lastcommand}" value="{autoremote_message}">',
                                '<p class="text-info">Available variables are: {device-lastcommand}, {device-name}</p>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="debug">Debug output to log:</label>',
                                '<input type="checkbox" id="debug" {debug}>',
                            '</div>',
                            '<div class="form-group">',
                                '<label for="debug">Current fetched weather information</label>',
                                '<p class="text-info">{weatherinfo}</p>',
                            '</div>',
                        '</div>',
                
                        '<div class="panel-footer">',
                            '<input class="btn btn-default" type="button" onclick="javascript:save_options();" value="Save">',
                        '</div>',
                    '</div>',
                '</form>'];
    
    body = body.join('\n');
    body = body.replace(/{city}/g,variables.options.city);
    body = body.replace(/{port}/g,variables.options.port);
    body = body.replace(/{appid}/g,variables.options.openweatherappid);
    body = body.replace(/{doubletapcount}/g,variables.options.doubletapcount);
    body = body.replace(/{doubletapseconds}/g,variables.options.doubletapseconds);
    body = body.replace(/{weathercodes}/g,variables.options.weathercodes);
    body = body.replace(/{autoremote_password}/g,variables.options.autoremote_password);
    body = body.replace(/{autoremote_key}/g,variables.options.autoremote_key);
    body = body.replace(/{autoremote_message}/g,variables.options.autoremote_message);
    body = body.replace(/{selecttheme}/g,createdropdown_alphanumeric([['blue','Blue'],['white','White'], ['green','Green']],variables.options.theme));
    var weatherinfo = 'No weather info available.';
    
    if (typeof(variables.weather.sys) != 'undefined') {
        var sunrise = new Date(variables.weather.sys.sunrise*1000); 
        var sunset = new Date(variables.weather.sys.sunset*1000);
        var hour = '0' + sunset.getHours();
        var minutes = '0' + sunset.getMinutes();
        hour = hour.substr(hour.length-2);
        minutes = minutes.substr(minutes.length-2);
        var sunsettime = hour + ":" + minutes;

        var hour = '0' + sunrise.getHours();
        var minutes = '0' + sunrise.getMinutes();
        hour = hour.substr(hour.length-2);
        minutes = minutes.substr(minutes.length-2);
        var sunrisetime = hour + ":" + minutes;


        
    
        var weatherinfo = ['City: ' + variables.weather.name,
                           'Country: ' + variables.weather.sys.country,
                          'Weathercode: ' + variables.weather.weather[0].id,
                          'Weather: ' + variables.weather.weather[0].main,
                          'Sunrise: ' + sunrisetime,
                          'Sunset: ' + sunsettime];
        weatherinfo = weatherinfo.join('<br>');
    }
    var debugchecked = '';
    if ( (variables.debug == 'true') || (variables.debug === true) ) {
        debugchecked = 'checked=checked';
    };
    body = body.replace(/{weatherinfo}/g,weatherinfo);    
    body = body.replace(/{debug}/g,debugchecked);

    
    res.send(template(headline,body,true));
}

function post(req,res) {

    variables.options.city = req.body.city;
    variables.options.port = req.body.port;
    variables.options.openweatherappid = req.body.appid;
    variables.options.doubletapcount = req.body.doubletapcount;
    variables.options.doubletapseconds = req.body.doubletapseconds;
    variables.options.weathercodes = req.body.weathercodes;
    variables.options.autoremote_password = req.body.autoremote_password;
    variables.options.autoremote_key = req.body.autoremote_key;
    variables.options.autoremote_message = req.body.autoremote_message;
    variables.options.theme = req.body.theme;
    variables.debug = req.body.debug;
    
    var option = JSON.stringify(variables.options,null,2);
    fs.writeFile(__dirname + '/../userdata/options.js',option, function(err) {
        if(err) throw err;
        console.log('Saved the options.');
        sharedfunctions.log('Saved the options.');
        res.send(true);
    });
}

exports.get = get;
exports.post = post;


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
        
        dropdown += '<option ' + selected + ' value="'+option[0]+'">'+displayname;
    });
    return dropdown;
}