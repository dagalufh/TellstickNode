console.log('This will try to install the application for you.');
console.log('This includes installing node-windows if not already installed. Linking directories for this and running npm install to install dependencies.');
console.log('The end result is a service running with this program.');

var exec = require('child_process').exec;
console.log('Checking to see if node-windows is installed');
exec('npm list -g node-windows', null, function (error,stdout,stderr) {
    
    if (stdout.toString().indexOf('empty') !== -1) {
        console.log('node-windows is not installed globally.');
        
        // Install node-windows if it's not installed.
        exec('npm install -g node-windows', null, function (error,stdout,stderr) {
                exec('npm link node-windows', null, function (error,stdout,stderr) {
                    console.log(stdout);
                    console.log('Linked node-windows with current directory.');
                    console.log('Trying to installing required modules');
                    exec('npm install', null, function (error,stdout,stderr) {
                        console.log(stdout);
                        console.log('Installed the dependencies for the application');
                        console.log('This will need elevated permissions but that will be asked for when needed.');
                        exec('node service_install.js', null, function (error,stdout,stderr) {
                            console.log(stdout);
                            console.log('Installed the service');
                            console.log('The service should be started automatically. Otherwise you can start it by going into services and start the "TellstickNode" service. If there is an error, check in the daemon folder.');
                            console.log('Check if you can reach the application on the predefined address: http://127.0.0.1:8888');
                        });
                    });
                });
        });
    } else {
        console.log('node-windows is already installed. No need to install it twice.');
        exec('npm link node-windows', null, function (error,stdout,stderr) {
            console.log(stdout);
            console.log('Trying to installing required modules');
            exec('npm install', null, function (error,stdout,stderr) {
                console.log(stdout);
                console.log('Installed the dependencies for the application');
                console.log('This will need elevated permissions but that will be asked for when needed.');
                exec('node service_install.js', null, function (error,stdout,stderr) {
                    console.log(stdout);
                    console.log('Installed the service');
                    console.log('The service should be started automatically. Otherwise you can start it by going into services and start the "TellstickNode" service. If there is an error, check in the daemon folder.');
                    console.log('Check if you can reach the application on the predefined address: http://127.0.0.1:8888');
                });
            });
           
        });
    }
});