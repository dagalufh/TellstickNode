// Include the template view (Do all the presentation(?))
var template = require('../views/template-main').build;
var variables = require('../model/variables');

// Include the functions for handling files
var fs = require('fs');

function get(req,res) {
    var devicefunctions = require('../controllers/device');
    // Save via socket.io call, this means we can toss back a reply that it's done. Or not needed.. res.send('Complete') will suffice.
    var headline = 'View Log';
    var body = ['<div class="panel panel-default">',
                     '<div class="panel-heading">',
                        '<h5 class="panel-title">Select Logfile</h5>',
                    '</div>',
                    '<div class="panel-body">',
                        '<table class="table table-bordered">',
                            '<tr><td class="td-middle">Logfile:</td><td><select id="logtoview">{logtoview}</select></td></tr>', 
                        '</table>',
                    '</div>',
                '</div>',
                '<div class="panel panel-default">',
                        '<div class="panel-body">',
                            '<div class="table-responsive">',
                            '<table class="table table-bordered table-condensed" id="logtable">',
                                '{log}',
                            '</table>',
                            '</div>',
                        '</div>',
                    '</div>'];
    
    body = body.join('\n');
    var logs = '';
    
    
    var logfolder = fs.readdirSync(variables.rootdir + 'logs/');
    var logfilelist = [];
    
    
    if(typeof(req.query.logfile) != 'undefined') {
        selected_file = req.query.logfile;
    } else {
        selected_file = '';   
    }
    
    
    logfolder.sort(function(a, b) {
                return a > b ? -1 : 1;
        })

    var defaultlogfile = '';
    logfolder.forEach(function (folder) {
        //backuplist += '<table class="table"><tr class="pointer" onclick="showfiles(\'' + backup + '\')"><th>Backup date: ' + backup + '</th></tr>';
        var foldercontents = fs.readdirSync(variables.rootdir + 'logs/' + folder);
        foldercontents.forEach(function(file) {
            var devicename = 'Core';
            var selected = '';
            
            if (file.indexOf('-') != -1) {
                devicename = devicefunctions.getdeviceproperty(file.substr((file.indexOf('-')+1),(file.indexOf('.')-(file.indexOf('-')+1))),'name');
            }
            
            if ( (selected_file == folder + '\\' + file) || (selected_file.length === 0) ) {
                selected = 'selected';   
            }
            
            
            logfilelist.push('<option ' + selected + ' value="' + folder + '\\' + file + '">'+folder + '\\' + file + ' (' + devicename+ ')');
            defaultlogfile = folder + '\\' + file;
            
            if (selected_file.length === 0) {
                selected_file = defaultlogfile;
            }
        });
    });
    
    
    
    var data = fs.readFileSync(variables.rootdir + 'logs/' + selected_file,{'encoding':'utf8'});
    
    if (data.length>1) {
        var rows = data.split('\n');
        for (var i=0; i<rows.length; i++) {
            //var message = rows[i].message.replace(/\s(id:)\s\d*(\s|$)/g,function (id) {return ' id: <a onclick="showscheduleinfo(\''+id.match(/\d+/g)+'\')">'+id.match(/\d+/g)+'</a>';});
            var time = rows[i].substr(0,rows[i].indexOf(','));
            var message = rows[i].substr(rows[i].indexOf(',')+1);
            logs += '<tr><td class="td-small text-info">' + time + '</td><td class="text-info">' + message + "</td></tr>";
        }
    }
    
    
    //variables.log.forEach(function (logentry) {
    //    var message = logentry.message.replace(/\s(id:)\s\d*(\s|$)/g,function (id) {return ' id: <a onclick="showscheduleinfo(\''+id.match(/\d+/g)+'\')">'+id.match(/\d+/g)+'</a>';});
    //    logs += '<tr><td class="td-small text-info">' + logentry.time + '</td><td class="text-info">' + message + "</td></tr>";     
    //});
    
    body = body.replace(/{log}/g,logs);
    body = body.replace(/{logtoview}/g,logfilelist.join('\n'));

    res.send(template(headline,body,true));
}

exports.get = get;