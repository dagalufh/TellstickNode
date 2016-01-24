function post(req, res) {
  // Include the functions for handling files
  var fs = require('fs');
  var saltedpasswords = require('../functions/saltedpasswords.js').saltedpasswords;
  var Users;
  var currentSession;
  fs.readFile(__dirname + '/../userdata/user.js', {
    'encoding': 'utf8'
  }, function(err, data) {
    if (err) throw err;
    Users = JSON.parse(data);

    if ((Users.username == req.body.username) && (saltedpasswords(req.body.password, req.body.password, Users.password))) {
      var date = new Date();
      currentSession = req.session;
      currentSession.lastactive = date.getTime();
      currentSession.username = Users.username;
      currentSession.hash = saltedpasswords(Users.username + 'tellstick', 8);

      res.send('true');
    } else {
      res.send('false');
    }
  });


}
exports.post = post;