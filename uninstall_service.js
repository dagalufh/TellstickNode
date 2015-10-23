if (process.platform == 'win32') {
    
    var Service = require('node-windows').Service;

    // Create a new service object
    var svc = new Service({
      name:'TellstickNode',
      script: require('path').join(__dirname,'TellstickNode.js')
    });

    // Listen for the "uninstall" event so we know when it's done.
    svc.on('uninstall',function(){
      console.log('Uninstall complete.');
      console.log('The service exists: ',svc.exists);
    });

    // Uninstall the service.
    svc.uninstall();
} else {
    console.log('The service removal can only be run on Windows. It\'s for node-windows to remove service.');
}