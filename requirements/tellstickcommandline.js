//console.log(process.argv);
var fs = require('fs');
var http = require('http');
var args = process.argv;
var configfile = './tellstickdemo.config';
if (args[2] == '--list-devices') {
  var options = {
    host: '127.0.0.1',
    port: '8889',
    path: '/?command=list-devices'
  };

  var reg = http.get(options, function(res) {
      var str = '';
      res.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      res.on('end', function () {
        console.log(str);
      });
      res.on('error', function(chunk) {
        console.log(chunk);
        // Error
      });
  });
 
} else if (args[2] == '--version') {
  var options = {
    host: '127.0.0.1',
    port: '8889',
    path: '/?command=version'
  };

  var reg = http.get(options, function(res) {
      var str = '';
      res.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      res.on('end', function () {
        console.log(str);
      });
      res.on('error', function(chunk) {
        console.log(chunk);
        // Error
      });
  });

} else if (args[2] == '--on') {
  var options = {
    host: '127.0.0.1',
    port: '8889',
    path: '/?command=devices&id=' + args[3] + '&status=on'
  };

  var reg = http.get(options, function(res) {
      var str = '';
      res.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      res.on('end', function () {
        console.log(str);
      });
      res.on('error', function(chunk) {
        console.log(chunk);
        // Error
      });
  });
} else if (args[2] == '--off') {
  var options = {
    host: '127.0.0.1',
    port: '8889',
    path: '/?command=devices&id=' + args[3] + '&status=off'
  };

  var reg = http.get(options, function(res) {
      var str = '';
      res.on('data', function (chunk) {
        str += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      res.on('end', function () {
        console.log(str);
      });
      res.on('error', function(chunk) {
        console.log(chunk);
        // Error
      });
  });
} else {
  var commands = [
    '--list-devices \t Returns a list of all devices',
    '--initiate [numberofdevices] \t Creates a set of dummydata.',
    '--on [id] \t Turns the device with {id} on.',
    '--off [id] \t Turns the device with {id} off.'
  ]
  console.log('Usage: \n' + commands.join('\n'));
}