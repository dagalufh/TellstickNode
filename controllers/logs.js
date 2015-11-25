// Include the template view (Do all the presentation(?))
var template = require('../views/template-main').build;
var variables = require('../model/variables');

// Include the functions for handling files
var fs = require('fs');

function get(req,res) {
    // Save via socket.io call, this means we can toss back a reply that it's done. Or not needed.. res.send('Complete') will suffice.
    var headline = 'View Log';
    var body = ['<div class="panel panel-default">',
                        '<div class="panel-body">',
                            '<div class="table-responsive">',
                            '<table class="table table-bordered table-condensed">',
                                '{log}',
                            '</table>',
                            '</div>',
                        '</div>',
                    '</div>'];
    
    body = body.join('\n');
    var logs = '';
    variables.log.forEach(function (logentry) {
        var message = logentry.message.replace(/\s(id:)\s\d*(\s|$)/g,function (id) {return ' id: <a onclick="showscheduleinfo(\''+id.match(/\d+/g)+'\')">'+id.match(/\d+/g)+'</a>';});
        logs += '<tr><td class="td-small text-info">' + logentry.time + '</td><td class="text-info">' + message + "</td></tr>";     
    });
    
    body = body.replace(/{log}/g,logs);

    res.send(template(headline,body,true));
}

exports.get = get;