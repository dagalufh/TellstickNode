var variables = require('../model/variables');
var fs = require('fs');
function build (pagetitle, content,loggedin) {
    
    // Defaults
    var title = 'TellstickNode ' + variables.currentversion;
    // Build the body layout
    var body = ['<!doctype html>',
                    '<html lang="en">\n\n<meta charset="utf-8">\n',
                    '<head>',
                        '<title>{title}</title>',
                        '<meta name="viewport" content="width=device-width, initial-scale=1">',
                        '<link rel="stylesheet" href="css/bootstrap.min.css" />',
                        '<link rel="stylesheet" href="css/{activestylesheet}" />\n',
                        '<script src="/socket.io/socket.io.js"></script>',
                        '<script src="jscript/jquery-2.1.1.min.js"></script>',
                        '<script src="jscript/bootstrap.min.js"></script>',
                        '<script src="jscript/functions.js"></script>',

                    '</head>',
                    '<body>',
                        '<div class="panel panel-default">',
                            '<nav class="navbar navbar-default navbar-fixed-top">',
                            '<div class="container-fluid">',
                                '<div class="navbar-header">',
                                   '<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">',
                                   '<span class="sr-only">Toggle navigation</span>',
                                   '<span class="icon-bar"></span>',
                                   '<span class="icon-bar"></span>',
                                   '<span class="icon-bar"></span>',
                                  '</button>',
                                  '<a class="navbar-brand" href="/">TellstickNode</a>',
                                '</div>',
                                '<div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">',
                                    '<ul class="nav navbar-nav">',
                                        '{navbar}',
                                    '</ul>',
                                '</div>',
                            '</div>',
                            '</nav>',
                            '<div class="panel-heading">',
                                '<h4>{pagetitle}</h4>',
                            '</div>',                
                            '<div id="content" class="panel-body">{content}</div>',
                        '</div>',
                '<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">',
  '<div class="modal-dialog">',
    '<div class="modal-content">',
      '<div class="modal-header">',
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>',
        '<h4 class="modal-title" id="myModalLabel">Notification</h4>',
      '</div>',
      '<div class="modal-body">',
        '<span id="respons-modal-body"></span>',
      '</div>',
      '<div class="modal-footer">',
        '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>',
      '</div>',
    '</div>',
  '</div>',
'</div>',
                    '</body>'];
    // Combine the above array into one string
    
    body = body.join('\n');
    
    // Replace keywords
    body = body.replace(/{title}/g,title);
    body = body.replace(/{pagetitle}/g,pagetitle);
    body = body.replace(/{content}/g,content);
    
    var activesheet = '';
    if(variables.options.theme == 'white') {
        activesheet = 'style.css';
    } else if(variables.options.theme == 'blue') {
        activesheet = 'style_blue.css';
    } else if(variables.options.theme == 'green') {
        activesheet = 'style_green.css';
    }
    body = body.replace(/{activestylesheet}/g,activesheet);
    
    
    var activeschedule = '';
    var activehome = '';
    var activeoptions = '';
    var activelogs = '';
    var activeremote = '';
    
    switch(pagetitle){
            case('New Schedule'):
                activeschedule = 'class="active"';
                break;
            case('Home'):
                activehome = 'class="active"';
                break;
            case('Options'):
                activeoptions = 'class="active"';
                break;
            case('View Log'):
                activelogs = 'class="active"';
                break;
            case('Remote'):
                activeremote = 'class="active"';
                break;
    }
            
    navigationbar = ['<li ' + activehome + '><a href="/">Home</a></li>',
        '<li ' + activeremote + '><a href="/remote">Remote</a></li>'];
    
    if(loggedin) {
        navigationbar = ['<li ' + activehome + '><a href="/">Home</a></li>',
                         '<li ' + activeremote + '><a href="/remote">Remote</a></li>',
                         '<li ' + activeschedule + '><a href="/newschedule">New Schedule</a></li>',
                         '<li ' + activeoptions + '><a href="/options">Options</a></li>',
                         '<li ' + activelogs + '><a href="/logs">View Log</a></li>',
                         '<li><a href="/logout">Logout</a></li>'];
    }
    navigationbar = navigationbar.join('\n');
    
    
    
    
    body = body.replace(/{navbar}/g,navigationbar);
    
    // Return the finished html body.
    return body;
}

exports.build = build;