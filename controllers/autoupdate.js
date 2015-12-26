
// Global variables
// New modulerequirements: 
// adm-zip
// ncp

/*
updatecheck
-> backup
--> downloadzip
---> removecurrent
----> movefiles
-----> cleanup
*/

function update(req,res) {
  var async = require('async');
  var variables = require('../model/variables');
  var rootcontents = [];
  
  async.series([
    function (callback) {
      
      // Step 1. Check GITHUB for latest version
      check_updates(variables.currentversion, callback);
    },
    function (callback) {
      // Step 2. Backup everything
      backup(callback);
    },
    function (callback) {
      // Step 3.a Remove everything currently in the directory except: node_modules, backup, userdata
      // List everything inside the root folder.
      
    },
    function (callback) {
      // Step 3.b Remove everything currently in the directory except: node_modules, backup, userdata
      // Then, remove things.
      
    },
    function (callback) {
      // Step 4. Download and unpack zipfile
    },
    function (callback) {
      // Step 5. Move everything new to the right directories.
    },
    function (callback) {
      // Step 6. Clean up the update files.
    }
  ], 
  function() {
    //finallly
  })
}

// Communicate to user via sockets?
var removalcontents = [];

// Update check, this checks the version thats on the github
function updatecheck (req,res) {
  var compareversion = require('compare-version');
  var variables = require('../model/variables');
  var http = require('https');
  var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/dagalufh/TellstickNode/releases/latest',
    method: 'GET',
    headers: {'User-Agent':'dagalufh'}
  }
  
  var request = http.get(options, function(response) {
    response.setEncoding('utf-8');
    var githubdata = '';
    response.on('data',function(d) {
     githubdata += d;
    });
    
    response.on('end', function() {
      var githubJSON = JSON.parse(githubdata);
      if (compareversion(githubJSON.tag_name,variables.currentversion) > 0) {
        // The GITHUB version is newer than the one we are currently running.
        
        // Make a backup first.
        backup();
      } else {
        // Return to the user that we don't need to update.
      }
      //verifyversion(JSON.parse(githubdata));
    });
  });
  
  request.on('error', function(e) {
    console.log('Error:' + e);
  })
  
}

function updatedownload(sourceurl) {
  var http = require('https');
  var fs = require('fs');
  var url = require('url');
  var AdmZip = require('adm-zip');
  sourceurl = url.parse(sourceurl);
  var options = {
    hostname: sourceurl.host,
    port: 443,
    path: sourceurl.pathname,
    method: 'GET',
    headers: {'User-Agent':'dagalufh'},
    encoding: null
  }
  
  var request = http.get(options, function(response) {
     if ( [301, 302].indexOf(response.statusCode) > -1 ) {
         updatedownload(response.headers.location); 
         return;
    }
    
    var zipfile = fs.createWriteStream('tellsticknode_update.zip')
    response.on('data',function(d) {
      zipfile.write(d);
    });
    
    zipfile.on('error', function (err) {
      console.log(err);
    });
    
     zipfile.on('finish', function () {
      console.log('Download Complete.');
      var zip = new AdmZip("tellsticknode_update.zip");
      var zipEntries = zip.getEntries(); // an array of ZipEntry records
      zip.extractAllTo(__dirname + '/update/', /*overwrite*/true)
      fs.unlink('./tellsticknode_update.zip');
      // First, everything should be deleted from __dirname/ except userdata and backup.
      removecurrent();
      movefiles();
    });
    
    response.on('end', function() {
      zipfile.end();
    });
   
  });
  
  request.on('error', function(e) {
    console.log('Error:' + e);
  })
  
}

var countfolders = 0;
function movefiles() {
  var fs = require('fs');
  var root = __dirname + '/update/';
  fs.readdir(root, function (err,contents) {
    try {
      if (fs.lstatSync(root + contents[0]).isDirectory()) {
        recursivedirectory(root + contents[0],'');
        
      }
    } catch (e) {
      console.log('Updatefolder is empty.');
    }
    
  });
}

function recursivedirectory (root, dir) {
  countfolders = countfolders +1;
  
  var fs = require('fs');
  fs.readdir(root + '/' + dir, function (err,contents) {
    
    contents.forEach(function (content) {
      
      var current = root + '/' + dir + '/' + content;
      
      if (fs.lstatSync(current).isDirectory()) {
       // console.log('Do the folder exist: ' + __dirname + '/test/' + dir);
        try {
          fs.statSync(__dirname + '/test/' + dir + '/' + content);
       //   console.log('Yes it exists.');
        } catch(e) {
      //    console.log('No, it dosn\'t exist.');
          fs.mkdirSync(__dirname + '/test/' + dir + '/' + content);
        }
        recursivedirectory(root, dir + '/' + content);
      } else {
       // console.log(current + '-->' + __dirname + '/test/' + dir + '/' + content);     
          // Recursive needed, need to move each file one at a time. Creating directories as needed.
        console.log('Moving file: ' + current);
        fs.rename(current, __dirname + '/test/' + dir + '/' + content);
        
      }
    })
    
    countfolders = countfolders -1;
    if (countfolders === 0) {
       console.log('Update completed.');
       removalcontents.push(__dirname + '/update/');
       recursiveremoval(root);
    }
  });
    
}

function recursiveremoval(dir) {
  countfolders = countfolders +1;
  var fs = require('fs');

  removalcontents.push(dir);
  fs.readdir(dir, function (err,contents) {
    var parentdir = '';
    
    if (typeof(contents) != 'undefined') {
      if (contents.length > 0) {
        contents.forEach(function (content) {
        recursiveremoval(dir + '/' + content);
        });
      }
    }
    countfolders = countfolders -1;
    if (countfolders === 0) {
      console.log('Starting cleaning process...');
      removalcontents.reverse();
      removalcontents.forEach(function (directory) {   
        try { 
          console.log('Removing; ' + directory);
          fs.rmdirSync(directory);
        } catch (e) {
          console.log('error:' + e);
        }
      });
      console.log('Cleaning done. Reboot your application to enjoy the new features.');
    }
  });
}

function backup(callback) {
  var ncp = require('ncp');
  var fs = require('fs');
  var variables = require('../model/variables');
  
  var currentdate = new Date();
  var hour = '0' + currentdate.getHours();
  var minutes = '0' + currentdate.getMinutes();
  var year = currentdate.getYear();
  var month = '0' + currentdate.getMonth();
  var day = '0' + currentdate.getDate();
  hour = hour.substr(hour.length-2);
  minutes = minutes.substr(minutes.length-2);
  month = month.substr(month.length-2);
  day = day.substr(day.length-2);
  
  var backuptargetdir = __dirname + '/../backup/' + variables.currentversion + '_' + year + month + day + hour + minutes;
  
  try {
    fs.mkdirSync(__dirname + '/../backup');
  } catch(e) {
    // Folder already exists...
  }
  try {
    fs.mkdirSync(backuptargetdir);
  } catch (e) {
    console.log('Backup (' + backuptargetdir + ') folder already exists.')
  }
  // MAKE COPY/BACKUP OF EVERYTHING FIRST BEFORE DOWNLOAD
  // USE: npm install ncp
  ncp.limit = 16;
  
  var filter = function(name) {
    if (name.indexOf('backup') == -1) {
      return true;
    } else {
      return false;
    }
  };
  
  ncp(__dirname + '/', backuptargetdir, {filter: filter}, function (err) {
   if (err) {
     return console.error(err);
   }
   console.log('Backup completed.');
    if (callback) {
      callback();
    }
  });
}

function check_updates (oldversion, callback,req,res) {
  var compareversion = require('compare-version');
      var http = require('https');
      var options = {
        hostname: 'api.github.com',
        port: 443,
        path: '/repos/dagalufh/TellstickNode/releases/latest',
        method: 'GET',
        headers: {'User-Agent':'dagalufh'}
      }

      var request = http.get(options, function(response) {
        response.setEncoding('utf-8');
        var githubdata = '';
        response.on('data',function(d) {
         githubdata += d;
        });

        response.on('end', function() {
          var githubJSON = JSON.parse(githubdata);
          
          if (compareversion(githubJSON.tag_name,oldversion) > 0) {
            // The GITHUB version is newer than the one we are currently running.
            if (res) {
              res.send({'status':true,'version':githubJSON.tag_name});
            } else {
              callback();
            }
          } else {
            if (res) {
              res.send({'status':false,'version':githubJSON.tag_name});
            } else {
              callback(true);
            }
            // Return to the user that we don't need to update.
          }
        });
      });

      request.on('error', function(e) {
        console.log('Error:' + e);
      })
}

//movefiles();
//updatecheck();


//exports.update = update;
// INCOMPLETE 
exports.check_updates = check_updates;
exports.backup = backup;