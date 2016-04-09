exports.check_weather = check_weather;

function check_weather(callback) {
	var dns = require('dns');
	var http = require('http');
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

	if (variables.options.city.toString().length > 0) {
		//weather.setCity(encodeURIComponent(variables.options.city));
		dns.lookup('api.openweathermap.org', function onLookup(err) {
			if (err) {
				//console.log('Unable to reach api.openweathermap.org');
				sharedfunctions.logToFile('Weather,Unable to reach api.openweathermap.org', 'Core');
				callback();
			} else {
				var options = {
					host: 'api.openweathermap.org',
					path: '/data/2.5/weather?q=' + encodeURIComponent(variables.options.city) + '&units=metric&lang=en&appid=' + variables.options.openweatherappid
				};

				http.get(options, function(res) {
					res.setEncoding('utf-8');

					// Hope to catch timeout errors.
					res.on('error', function() {
						if (callback) {
							callback();
						}

					});

					if (res.statusCode == 200) {
						res.on('data', function(chunk) {
							try {
								sharedfunctions.logToFile('Weather,Weatherinformation fetched from api.openwathermap.org with appID: ' + variables.options.openweatherappid, 'Core');
								var tempweather = JSON.parse(chunk);
								if ((typeof(tempweather) == 'undefined') || (tempweather === null)) {
									sharedfunctions.logToFile('Weather,Error occured while fetching data, did not receive anything.', 'Core');
								} else {
									sharedfunctions.logToFile('Weather,Weatherinfo received was: ' + JSON.stringify(tempweather), 'Core');
									variables.weather = tempweather;
								}
							} catch (e) {
								sharedfunctions.logToFile('Weather,Error fetching weatherinformation from api.openweathermap.org. Will try again within the recalculates.', 'Core');
							}
						});
						res.on('end', function() {
							if (callback) {
								callback();
							}
						});
						res.on('error', function() {
							// Error
						});
					} else {
						sharedfunctions.logToFile('Weather,An error occured while fetching weatherinformation from api.openweathermap.org. Received statuscode: ' + res.statusCode, 'Core');
						if (callback) {
							callback();
						}
					}

				}).on('error', function(err) {
					sharedfunctions.logToFile('Weather,Error occured with weather', 'Core');
					sharedfunctions.logToFile('Weather,Error was: ' + err.message.code, 'Core');
					if (callback) {
						callback();
					}

				});

			}
		});
	} else {
		sharedfunctions.logToFile('Weather,No city defined in options. Unable to fetch weather information.', 'Core');
		if (callback) {
			callback();
		}
	}
}