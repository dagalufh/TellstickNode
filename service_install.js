var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'TellstickNode',
  description: 'The TellstickNode Service.',
  script: require('path').join(__dirname,'TellstickNode.js')
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();

//console.log(__dirname.replace(/\\/g, '/') + '/TellstickNode.js');

/*

npm install -g node-windows
in script dir:
npm link node-windows
node install.js (this script)

*/