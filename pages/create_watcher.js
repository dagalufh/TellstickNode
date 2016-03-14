function get(req, res) {
  var variables = require('../templates/variables');
  var template = require(variables.rootdir + 'templates/template-main').build;
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');

  var headline = 'New Watcher';
  var body = [
    '<div class="panel panel-default">',
    '<div class="panel-heading">',
    'Watcher Settings',
    '</div>',
    '<div class="panel-body">',
    '<div class="form-group">',
    '<label for="Select_Enabled">Watcher enabled</label>',
    '<select id="Select_Enabled" class="form-control">',
    '{selectenabled}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="autoremote" Value="autoremote" {autoremote_selected}>AutoRemote - Send message when created schedule is triggered</label>',
    '</div>',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="onstatechanged" Value="onstatechanged" {onstatechanged_selected}>Check watcher on device status change (When device changes from On to Off or vise versa)</label>',
    '</div>',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="oncommandsent" Value="oncommandsent" {oncommandsent_selected}>Check watcher when a command is sent to the device</label>',
    '</div>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="panel panel-default">',
    '<div class="panel-heading">',
    'Monitor Device',
    '</div>',
    '<div class="panel-body">',
    '<p class="bg-danger">Note that regular schedules will trigger a Watcher for a device! Don\'t mix unless you know what you are doing.</p>',
    '<div class="form-group">',
    '<label for="Select_Device">When device:</label>',
    '<select id="Select_Device" class="form-control">',
    '{select_device}',
    '</select>',
    '</div>',
    '<div class="form-group">',
    '<label for="Select_Action">Changes state to:</label>',
    '<select id="Select_Action" class="form-control">',
    '{selectactiontrigger}',
    '</select>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="panel panel-default">',
    '<div class="panel-heading">',
    'Do these actions',
    '</div>',
    '<div class="panel-body">',
    '<div class="form-group">',
    '<label for="action_target_device">Device:</label>',
    '<select id="action_target_device" class="form-control">',
    '{action_target_device_list}',
    '</select>',
    '<label for="action_target_status">Set status:</label>',
    '<select id="action_target_status" class="form-control">',
    '{action_target_status_list}',
    '</select>',
    '<label for="action_target_wait">After minutes:</label>',
    '<input type="text" class="form-control" id="action_target_wait" placeholder="Minutes" value="0">',
    '<button class="btn btn-default" onclick="watcher_add_action();">Add action to list</button><br>',
    '</div>',
    '<div class="form-group">',
    '<div class="table-responsive">',
    '<table id="watcher_actions_table" cellpadding="0" cellspacing="0" class="table table-bordered">',
    '<tr><th>List of actions</th></tr>',
    '<tr><td><button class="btn btn-default" onclick="watcher_remove_action();">Remove selected actions</button></td></tr>',
    '</table>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="panel-footer"><button class="btn btn-default" onClick="Javascript:createwatcher();">Create Watcher</button></div>',
    '</div>'
  ];
  body = body.join("\n");

  var device_options = '';
  var target_devices = '';
  variables.devices.forEach(function(device, index) {
    if (device.type != 'group') {
      device_options += '<option value="' + device.id + '">' + device.name + '\n';
    }

    target_devices += '<option value="' + device.id + '">' + device.name + '</option>';

  });

  body = body.replace(/{action_target_device_list}/g, target_devices);
  body = body.replace(/{select_device}/g, device_options);
  body = body.replace(/{selectenabled}/g, sharedfunctions.createdropdown_alphanumeric([
    ['true', 'Yes'],
    ['false', 'No']
  ], ''));
  body = body.replace(/{selectactiontrigger}/g, sharedfunctions.createdropdown_alphanumeric([
    ['On'],
    ['Off']
  ], ''));
  body = body.replace(/{action_target_status_list}/g, sharedfunctions.createdropdown_alphanumeric([
    ['On'],
    ['Off']
  ], ''));

  res.send(template(headline, body, true));
}

exports.get = get;