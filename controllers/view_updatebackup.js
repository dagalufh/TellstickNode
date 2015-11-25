// Include the template view (Do all the presentation(?))


// Define the get function that will return the content..?
function get(request, response) {
  var variables = require('../model/variables');
  var template = require('../views/template-main');
  var sharedfunctions = require('../model/sharedfunctions');
  var fs = require('fs');
  
  var backups = fs.readdirSync(__dirname + '/../backup/auto/');
  var backuplist = '';
  
  backups.sort(function(a, b) {
				return a < b ? -1 : 1;
		})
  
   
  backups.forEach(function (backup) {
    backuplist += '<table class="table"><tr class="pointer" onclick="showfiles(\'' + backup + '\')"><th>Backup date: ' + backup + '</th></tr>';
    var foldercontents = fs.readdirSync(__dirname + '/../backup/auto/' + backup);
    foldercontents.forEach(function(file) {
      backuplist += '<tr class="files"><td><label class="checkbox-inline"><input type="checkbox" name="' + backup + '" value="' + file + '">' + file + '</label></td></tr>';
    });
		backuplist += '</table>';	
  });
  
  // Define the different parts of the page.
  var headline = 'Backups and Updates';
  var body = ['<div class="panel panel-default">',
                  '<div class="panel-heading">',
                      '<h5 class="panel-title">Check for Updates</h5>',
                  '</div>',
                  '<div class="panel-body">',
                    '<table>',
                      '<tr><td>Installed version: </td><td>' + variables.currentversion + '</td></tr>',
                      '<tr><td>Github version: </td><td><span id="githubversion"></span></td></tr>',
                      '<tr><td><button class="btn btn-default" onclick="check_updates()">Check for updates</button></td></tr>',
                    '</table>',
                  '</div>',
              '</div>',
              '<div class="panel panel-default">',
                  '<div class="panel-heading">',
                      '<h5 class="panel-title">Backups</h5>',
                  '</div>',
                  '<div class="panel-body">',
                  backuplist,
                  '<button class="btn btn-default" id="restorebackup" onclick="restore()">Restore Backup</button>',
                  '</div>',
              '</div>'
              ];

  // Join each row of the body array to a continious string with proper row endings.
  body = body.join("\n");
  response.send(template.build(headline,body,true));
   
}

exports.get = get;