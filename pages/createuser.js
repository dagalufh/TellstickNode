// Requests that come via GET is handled here.
function get(req, res) {
  // Include the functions for handling files
  var fs = require('fs');

  // Include the template view (Do all the presentation(?))
  var template = require('../templates/template-main');
  
  var headline = 'Create New User';
  var body = ['<form method="post" name="NewUserForm" enctype="application/x-www-form-urlencoded" action="/createuser">',
    '<p class="text-info">No user detected. You have to create a new one to be able to proceed.</p>',
    '<div class="form-group">',
    '<label for="username">Username:</label>',
    '<input type="text" class="form-control input-sm" name="username" placeholder="Username">',
    '</div>',
    '<div class="form-group">',
    '<label for="password">Password:</label>',
    '<input type="password" class="form-control input-sm" name="password" placeholder="Password">',
    '</div>',
    '<input class="btn btn-default btn-sm" type="submit" value="Create User">',
    '</form>'
  ];
  body = body.join("\n");

  var currentSession = req.session;
  if (currentSession.hash) {
    body = body + '[' + currentSession.hash + ']';
  }

  res.send(template.build(headline, body));

}

exports.get = get;

/*
function User() {
  this.username = '';
  this.passwqord = '';
}*/