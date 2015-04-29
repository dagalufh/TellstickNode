module.exports = {
    devices : [],
    options : {city:'',
               port:8888,
               doubletapcount:3,
               doubletapseconds:5,
               weathercodes:[300,301,600,701,800,801,802,803,804],
               autoremote_key: '',
               autoremote_password: '',
               autoremote_message: 'Device {device-id} was set to {device-lastcommand}'
              },
    weather : {},
    savetofile : false,
    log : [],
    tdtoolversionlimit : '2.1.2',
    debug : false,
    pauseschedules : false
}