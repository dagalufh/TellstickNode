// Include the template view (Do all the presentation(?))

var template = require('../views/template-main');

// Define the get function that will return the content..?
function get(request, response) {

    
    // Define the different parts of the page.
    var headline = 'Forbidden';
    var body = ['<div class="panel panel-default">',
                    '<div class="panel-body">',
                    'This page is forbidden to access from the outside network.',
                    '</div>',
                '</div>',
                ];
    
    // Join each row of the body array to a continious string with proper row endings.
    body = body.join("\n");
    response.send(template.build(headline,body,true));

}

exports.get = get;