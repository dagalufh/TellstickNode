exports.check_updates = check_updates;

function check_updates(oldversion, callback, req, res) {
  var compareversion = require('compare-version');
  var http = require('https');
  var options = {
    hostname: 'api.github.com',
    port: 443,
    path: '/repos/dagalufh/TellstickNode/releases/latest',
    method: 'GET',
    headers: {
      'User-Agent': 'dagalufh'
    }
  };

  var request = http.get(options, function(response) {
    response.setEncoding('utf-8');
    var githubdata = '';
    response.on('data', function(d) {
      githubdata += d;
    });

    response.on('end', function() {
      var githubJSON = JSON.parse(githubdata);

      if (compareversion(githubJSON.tag_name, oldversion) > 0) {
        // The GITHUB version is newer than the one we are currently running.
        if (res) {
          res.send({
            'status': true,
            'version': githubJSON.tag_name
          });
        } else {
          callback();
        }
      } else {
        if (res) {
          res.send({
            'status': false,
            'version': githubJSON.tag_name
          });
        } else {
          callback(true);
        }
        // Return to the user that we don't need to update.
      }
    });
  });

  request.on('error', function(e) {
    console.log('Error:' + e);
  });
}

