
function build(pagetitle, content, loggedin) {
var variables = require('./variables');
  var dev = '';
  // Defaults
  if (process.argv[2] == '--dev') {
    dev = 'DEVMODE - ';
    
  } 
  
  var title = dev + 'TellstickNode ' + variables.currentversion + ' Booted: ' + variables.lastbootup;
  // Build the body layout
  var body = ['<!doctype html>',
    '<html lang="en">\n\n<meta charset="utf-8">\n',
    '<head>',
    '<title>{title}</title>',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<link rel="stylesheet" href="css/bootstrap.min.css" />',
    '<link rel="stylesheet" href="css/style.css" />\n',
    '<link rel="stylesheet" href="css/{activestylesheet}" />\n',
    '<script src="/socket.io/socket.io.js"></script>',
    '<script src="jscript/jquery-2.1.1.min.js"></script>',
    '<script src="jscript/bootstrap.min.js"></script>',
    '<script src="jscript/functions.js"></script>',
    '{PageSpecificJS}',

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
    '<a class="navbar-brand" href="/">' + dev + 'TellstickNode</a>',
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
    '<span id="respons-modal-footer"><button type="button" class="btn btn-default" data-dismiss="modal">Close</button></span>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '</body>'
  ];
  // Combine the above array into one string

  body = body.join('\n');

  // Replace keywords
  body = body.replace(/{title}/g, title);
  body = body.replace(/{pagetitle}/g, pagetitle);
  body = body.replace(/{content}/g, content);

  var activesheet = '';
  if (variables.options.theme == 'white') {
    activesheet = 'style.css';
  } else if (variables.options.theme == 'blue') {
    activesheet = 'style_blue.css';
  } else if (variables.options.theme == 'green') {
    activesheet = 'style_green.css';
  }
  body = body.replace(/{activestylesheet}/g, activesheet);

  var activedevicegroup = '';
  var activeschedule = '';
  var activehome = '';
  var activeoptions = '';
  var activelogs = '';
  var activeremote = '';
  var activewatcher = '';
  var PageSpecificJS = '';
  switch (pagetitle) {
    case ('New Schedule'):
      activeschedule = 'active';
      PageSpecificJS = '<script src="jscript/schedule.js"></script>';
      break;
    case ('Home'):
      activehome = 'active';
      break;
    case ('Options'):
      activeoptions = 'active';
      PageSpecificJS = '<script src="jscript/options.js"></script>';
      break;
    case ('View Log'):
      activelogs = 'active';
      PageSpecificJS = '<script src="jscript/logs.js"></script>';
      break;
    case ('Changelog'):
      activelogs = 'active';
      break;
   case ('Customlogs'):
      activelogs = 'active';
      PageSpecificJS = '<script src="jscript/customlog.js"></script>';
      break;   
      
    case ('Remote'):
      activeremote = 'active';
      break;
    case ('New Watcher'):
      activewatcher = 'active';
      PageSpecificJS = '<script src="jscript/watchers.js"></script>';
      break;
    case ('Edit Watcher'):
      activewatcher = 'active';
      PageSpecificJS = '<script src="jscript/watchers.js"></script>';
      break;
    case ('View All Watchers'):
      activewatcher = 'active';
      break;
    case ('Edit Schedule'):
      activeschedule = 'active';
      PageSpecificJS = '<script src="jscript/schedule.js"></script>';
      break;
    case ('View All Schedules'):
      activeschedule = 'active';
      break;
    case ('New Devicegroup'):
      activedevicegroup = 'active';
      PageSpecificJS = '<script src="jscript/devicegroup.js"></script>';
      break;
    case ('View All Devicegroups'):
      activedevicegroup = 'active';
      PageSpecificJS = '<script src="jscript/devicegroup.js"></script>';
      break;
    case ('Edit Devicegroup'):
      activedevicegroup = 'active';
      PageSpecificJS = '<script src="jscript/devicegroup.js"></script>';
      break;
    case ('Edit Devicegroup'):
      activedevicegroup = 'active';
      PageSpecificJS = '<script src="jscript/devicegroup.js"></script>';
      break;
    case ('Backups and Updates'):
      activeoptions = 'active';
      PageSpecificJS = '<script src="jscript/backupupdate.js"></script>';
      break;
    case ('Login'):
      PageSpecificJS = '<script src="jscript/login.js"></script>';

  }

  var navigationbar = ['<li ' + activehome + '><a href="/">Home</a></li>',
    '<li ' + activeremote + '><a href="/remote">Remote</a></li>'
  ];

  if (loggedin) {
    navigationbar = ['<li class="' + activehome + '"><a href="/">Home</a></li>',
      '<li class="dropdown ' + activeschedule + '">',
      '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Schedules & Timers <span class="caret"></span></a>',
      '<ul class="dropdown-menu">',
      '<li><a href="/newschedule">New</a></li>',
      '<li><a href="/view_schedules">View All</a></li>',
      '</ul>',
      '</li>',
      '<li class="dropdown ' + activewatcher + '">',
      '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Watchers <span class="caret"></span></a>',
      '<ul class="dropdown-menu">',
      '<li><a href="/newwatcher">New</a></li>',
      '<li><a href="/view_watchers">View All</a></li>',
      '</ul>',
      '</li>',
      '<li class="dropdown ' + activedevicegroup + '">',
      '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Devicegroups<span class="caret"></span></a>',
      '<ul class="dropdown-menu">',
      '<li><a href="/new_devicegroup">New</a></li>',
      '<li><a href="/view_devices">View All</a></li>',
      '</ul>',
      '</li>',
      '<li class="dropdown ' + activeoptions + '">',
      '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Options <span class="caret"></span></a>',
      '<ul class="dropdown-menu">',
      '<li><a href="/options">Options</a></li>',
      '<li><a href="/view_restorebackup">Backup/Restore</a></li>',
      '</ul>',
      '</li>',
      //'<li class="' + activeschedule + '"><a href="/newschedule">New Schedule</a></li>',
      //'<li class="' + activewatcher + '"><a href="/newwatcher">New Watcher</a></li>',
      '<li class="dropdown ' + activelogs + '">',
      '<a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-haspopup="true" aria-expanded="false">Logs <span class="caret"></span></a>',
      '<ul class="dropdown-menu">',
      '<li><a href="/changelog">Changelog</a></li>',
      '<li><a href="/custom_logs">Custom Logs</a></li>',
      '<li><a href="/logs">Built-in Logs</a></li>',
      '</ul>',
      '</li>',
      '<li><a href="/logout">Logout</a></li>'
    ];
  }
  navigationbar = navigationbar.join('\n');
  body = body.replace(/{navbar}/g, navigationbar);
  body = body.replace(/{PageSpecificJS}/g, PageSpecificJS);

  // Return the finished html body.
  return body;
}

exports.build = build;