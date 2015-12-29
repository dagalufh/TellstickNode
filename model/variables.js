
module.exports = {
    devices : [],
    options : {city:'',
               port:8888,
               doubletapcount:3,
               doubletapseconds:5,
               weathercodes:[300,301,600,701,800,801,802,803,804],
               autoremote_key: '',
               autoremote_password: '',
               autoremote_message: 'Device {device-name} was set to {device-lastcommand}',
               showdimoption: false,
               theme: 'blue',
               openweatherappid: ''
              },
    weather : {},
    savetofile : false,
    log : [],
    tdtoolversionlimit : '2.1.2',
    debug : true,
    pauseschedules : false,
    currentversion: '1.0.16',
    doubletap: [],
    rootdir: '',
    tdtool: function () {
        var os = require('os');
        var tdtoolpath = '';
        
        if (process.argv[2] == '--dev') {
            //sharedfunctions.logToFile('tdtool,Dev discovered, using TellstickDemo.js','Core');
            var tdtoolpath = 'node" "' + this.rootdir + 'requirements/tellstickdemo.js';
        } else if (os.platform() === 'win32') {
            //console.log('Server is a Windows machine. Run tdtool.exe to fetch a list of devices.');
            //sharedfunctions.logToFile('tdtool,Called requirements/tdtool.exe','Core');
            var tdtoolpath =  this.rootdir + 'requirements/tdtool.exe';
            //console.log(path);
        } else if (os.platform() == 'linux') {
            //console.log('Server is a Linux machine. Run tdtool to switch status on device.');
            //sharedfunctions.logToFile('tdtool,Calling tdtool','Core');
            var tdtoolpath = 'tdtool';
        }
        return tdtoolpath;
    },
    restoreInProgress: false
}