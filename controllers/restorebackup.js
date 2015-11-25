var variables = require('../model/variables');
function restore(req,res) {
  var async = require('async');  
  var sharedfunctions = require('../model/sharedfunctions');
  variables.restoreInProgress = true;
  async.series([
    function (callback) {
      // Copy back the selected files, overwriting current files.
      var fse = require('fs-extra');
      var copycounter = 0;
      var errors = [];
      req.body.files.forEach( function(file) {
        copycounter = copycounter+1;
        sharedfunctions.log('Restoring [' + variables.rootdir + 'backup/auto/' + req.body.folder + '/' + file + '] To [' +  variables.rootdir + 'userdata/' + file + ']');
        fse.copy(variables.rootdir + 'backup/auto/' + req.body.folder + '/' + file, variables.rootdir + 'userdata/' + file, function(err) {
          if (err) {
              sharedfunctions.log('Error restoring [' + variables.rootdir + 'backup/auto/' + req.body.folder + '/' + file + '] To [' +  variables.rootdir + 'userdata/' + file + ']');
            errors.push('Error occured with file: ' + req.body.folder + '/' + file + ' copying to ' + 'userdata/' + file + '. Err: ' + err);
          }
            sharedfunctions.log('Successfully restored [' + variables.rootdir + 'backup/auto/' + req.body.folder + '/' + file + '] To [' +  variables.rootdir + 'userdata/' + file + ']');
          copycounter = copycounter-1;
          if (copycounter === 0) {
            callback(null,errors);
          }
        })
      });
    },
    function (callback) {
        var load_userdata = require('../controllers/load_userdata');
        load_userdata(callback);
    }
  ], function (err, result) {
    variables.restoreInProgress = false;
    res.send({'status': true, 'message': 'Complete'})
  })
}

exports.restore = restore;