function get(req,res) {
    var body = ['<html>',
        '<title>TellstickNode</title>',
            '</head>',
            '<body>',
            'TellstickNode has been shutdown. Click <a href="/">here</a> to try to access it again if you have a process restarter.',
            '</body>',
            '</html>'];
    res.send(body.join('\n'));
    setTimeout(function() { process.exit(); }, 1000);
}

exports.get = get;