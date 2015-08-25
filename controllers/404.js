// Include the template view (Do all the presentation(?))

var template = require('../views/template-main');

// Define the get function that will return the content..?
function get(request, response) {

    
    // Define the different parts of the page.
    var headline = 'Not Found';
    var body = ['<div class="panel panel-default">',
                    '<div class="panel-body">',
                    'Unable to find the page you requested.',
                    '</div>',
                '</div>',
                ];
    
    // Join each row of the body array to a continious string with proper row endings.
    body = body.join("\n");
    response.send(template.build(headline,body,false),404);

}

exports.get = get;