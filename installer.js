var exec = require('child_process').exec;
var fs = require('fs');
packageoriginal = require('path').join(__dirname,'package.json');
packagesqlite3 = require('path').join(__dirname,'package_sqlite3.json');
packagefs = require('path').join(__dirname,'package_filesession.json');


if (process.platform == 'win32') {
    //#################################################################################################
    console.log('This will try to install the application for you.');
    console.log('This includes installing node-windows if not already installed. Linking directories for this and running npm install to install dependencies.');
    console.log('The end result is a service running with this program.');
    console.log('------------------------------------------------------');
    console.log('Checking to see if node-windows is installed');
    exec('npm list -g node-windows', null, function (error,stdout,stderr) {

        if (stdout.toString().indexOf('empty') !== -1) {
            console.log('node-windows is not installed globally.');

            // Install node-windows if it's not installed.
            console.log('Running "npm install -g node-windows');
            exec('npm install -g node-windows', null, function (error,stdout,stderr) {
                    console.log('------------------------------------------------------');
                    console.log('Running "npm link node-windows"');
                    exec('npm link node-windows', null, function (error,stdout,stderr) {
                        console.log(stdout);
                        console.log('Linked node-windows with current directory.');
                        console.log('------------------------------------------------------');
                        console.log('Trying to installing required modules');

                        console.log('Renaming package_sqlite3.json to package.json before continuing');
                        fs.rename(packagesqlite3, packageoriginal, function (err) {
                            console.log('Running "npm install"');
                            exec('npm install', null, function (error,stdout,stderr) {
                                console.log(stdout);
                                console.log('Installed the dependencies for the application');
                                console.log('------------------------------------------------------');
                                console.log('Creating service. This will need elevated permissions but that will be asked for when needed.');

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
                                console.log('Installed the service');
                                console.log('The service should be started automatically. Otherwise you can start it by going into services and start the "TellstickNode" service. If there is an error, check in the daemon folder.');
                                console.log('Check if you can reach the application on the predefined address: http://127.0.0.1:8888');
                                fs.renameSync(packageoriginal, packagesqlite3);

                            });
                        });
                    });
            });
        } else {
            console.log('node-windows is already installed. No need to install it twice.');
            console.log('Running "npm link node-windows"');
            exec('npm link node-windows', null, function (error,stdout,stderr) {
                console.log(stdout);
                console.log('------------------------------------------------------');
                console.log('Trying to installing required modules');
                console.log('Renaming package_sqlite3.json to package.json before continuing');
                fs.rename(packagesqlite3, packageoriginal, function (err) {
                    console.log(err);

                    console.log('Running "npm install"');
                    exec('npm install', null, function (error,stdout,stderr) {
                        console.log(stdout);
                        console.log('Installed the dependencies for the application');
                        console.log('------------------------------------------------------');
                        console.log('Creating service. This will need elevated permissions but that will be asked for when needed.');

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
                        console.log('Installed the service');
                        console.log('The service should be started automatically. Otherwise you can start it by going into services and start the "TellstickNode" service. If there is an error, check in the daemon folder.');
                        console.log('Check if you can reach the application on the predefined address: http://127.0.0.1:8888');
                        fs.renameSync(packageoriginal, packagesqlite3);

                    });
                });

            });
        }
    });
    //#################################################################################################
} else {
    console.log('This will try to install the application for you.');
    console.log('This includes installing forever and forever-service and running npm install to install dependencies.');
    console.log('The end result is a service running with this program.');
    
    // if using an arm processor, stick with filesessionstorage because of issue installing sqlite3 on raspberrypi.
    if(process.arch == 'arm'){
        console.log('Platform is arm architecture. Lets use filesession.');
        fs.renameSync(packagefs, packageoriginal);
    } else {
        console.log('Platform is not arm architecture. Lets use sqlite3.');
        fs.renameSync(packagesqlite3, packageoriginal);
    }

    console.log('Starting installation of dependencies');
    exec('npm install', null, function (error,stdout,stderr) {
        console.log(stderr);
        console.log('Starting installation of forever');
        exec('sudo npm install -g forever', null, function (error,stdout,stderr) {
            console.log(stderr);
            console.log('Starting installation of forever-service');
            exec('sudo npm install -g forever-service', null, function (error,stdout,stderr) {
                console.log(stderr);
                console.log('Setting up the service');
                exec('sudo forever-service install tellsticknode --script TellstickNode.js',null, function (error,stdout,stderr) {
                    console.log(stderr);
                    console.log(stdout);
                    console.log('Done');
                    if(process.arch == 'arm'){
                        fs.renameSync(packageoriginal, packagefs);
                    } else {
                        fs.renameSync(packageoriginal, packagesqlite3);
                    }
                });

            });

        });

    });
}