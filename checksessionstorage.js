console.log('Installing a session handler.');
console.log('Will try with sqlite3 first, this can take a while.');
var exec = require('child_process').exec;
exec('npm install sqlite3',null,function (error, stdout, stderr) {
    if (error.toString().toLowerCase().indexOf('command failed') != -1) {
        console.log('Failed to install sqlite3. Will be using session-file-store instead.');   
        exec('npm install session-file-store',null,function (error, stdout, stderr) {
            console.log('Finished installing session handler.');
        });
    } else {
        console.log('Installing Knex.');
        exec('npm install knex',null,function (error, stdout, stderr) {
            console.log('Installing connect-session-knex');
            exec('npm install connect-session-knex',null,function (error, stdout, stderr) {
                console.log('Finished installing session handler.');
            }); 
        });
    }
});