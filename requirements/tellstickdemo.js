//console.log(process.argv);
var fs = require('fs');
var fs = require('fs');
var args = process.argv;
var configfile = './tellstickdemo.config';
args[2] = args[2].trim();


if (args[2] == '--list-devices') {
  try {
    var contents = fs.readFileSync(configfile, 'utf-8');
    contents = contents.split('\n');

    contents.forEach(function (test) {
      var object = JSON.parse(test);
      var row = ""
      for (var key in object) {
        row += key + '=' + object[key] + '\t';
      }
      console.log(row);
    });
    
    
  } catch (e) {
    console.log(e);
  }
} else if (args[2] == '--initiate') {
  var deviceobjects = [];
  var numberOfDevices = 10
  if (isNaN(args[3]) === false) {
    numberOfDevices = args[3];
  }
  
  for (var i = 0; i < numberOfDevices; i++) {
    deviceobjects.push(JSON.stringify({'type': 'device','id': i, 'name': 'DemoDevice-' + i, 'lastsentcommand': 'off'}));
  }
  
  fs.writeFileSync(configfile,deviceobjects.join('\n'));
} else if (args[2] == '--version') {
  console.log('Version: 2.5.0');
  
} else if (args[2] == '--on') { 
    args[3] = args[3].trim();
    var deviceobjects = [];
    try {
        var contents = fs.readFileSync(configfile, 'utf-8');
        contents = contents.split('\n');
        var targetdevicename = '';
        contents.forEach(function (test) {
          var object = JSON.parse(test);

          if(object.id == args[3]) {
            object.lastsentcommand = 'on';
            targetdevicename = object.name;
          }
          deviceobjects.push(JSON.stringify(object));
        });

        fs.writeFileSync(configfile,deviceobjects.join('\n'));
        console.log('Successfully send command to device ' + targetdevicename + '.');
    } catch (e) {
        console.log(e);
    }  
} else if (args[2] == '--off') {
    args[3] = args[3].trim();
  var deviceobjects = [];
    try {
      var contents = fs.readFileSync(configfile, 'utf-8');
      contents = contents.split('\n');
      var targetdevicename = '';
      contents.forEach(function (test) {
        var object = JSON.parse(test);

        if(object.id == args[3]) {
          object.lastsentcommand = 'off';
          targetdevicename = object.name;
        }
        deviceobjects.push(JSON.stringify(object));
      });

      fs.writeFileSync(configfile,deviceobjects.join('\n'));
      console.log('Successfully send command to device ' + targetdevicename + '.');
    } catch (e) {
      console.log(e);
    }    
} else {
  var commands = [
    '--list-devices \t Returns a list of all devices',
    '--initiate [numberofdevices] \t Creates a set of dummydata.',
    '--on [id] \t Turns the device with {id} on.',
    '--off [id] \t Turns the device with {id} off.',
    '--version \t Displays version of tool'
  ]
  console.log('Usage: \n' + commands.join('\n'));
}