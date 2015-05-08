var exec = require('child_process').exec;
console.log('Installing TellstickNode');
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
            });
            
        });
        
    });
    
});
