function get(req, res) {
  var variables = require('../templates/variables');
  var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
  var template = require(variables.rootdir + 'templates/template-main').build;
  var deviceaction = require(variables.rootdir + 'functions/device');

  var selected_watcher = '';
  variables.devices.forEach(function(device) {
    device.watchers.forEach(function(watcher) {
      if (watcher.uniqueid == req.query.uniqueid) {
        selected_watcher = watcher;
      }
    });
  });

  var headline = 'Edit Watcher';
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
    '<select id="Select_Device" class="form-control" disabled>',
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
    '{watcher_action_table}',
    '<tr><td><button class="btn btn-default" onclick="watcher_remove_action();">Remove selected actions</button></td></tr>',
    '</table>',
    '</div>',
    '</div>',
    '</div>',
    '<div class="panel-footer"><button class="btn btn-default" onClick="Javascript:createwatcher(' + selected_watcher.uniqueid + ');">Save Changes</button></div>',
    '</div>'
  ];
  body = body.join("\n");

  var device_options = '';
  var target_devices = '';
  var controllermessage = '';

  // Do all the calculations and work
  variables.devices.forEach(function(device, index) {
    var selected_device = '';
    if (device.id == selected_watcher.deviceid) {
      selected_device = 'selected';
      target_devices += '<option ' + selected_device + ' value="' + device.id + '">' + device.name + ' (This Device)</option>';
    } else {
      target_devices += '<option ' + selected_device + ' value="' + device.id + '">' + device.name + '</option>';
    }
    device_options += '<option ' + selected_device + ' value="' + device.id + '">' + device.name + '</option>';

  });
  //var watcher_actions = '';
  var watcher_action_table = '';
  selected_watcher.actions.forEach(function(action) {
      //watcher_actions += '<option value="' + action.id + ',' + action.status + ',' + action.delay + '">Change "'+deviceaction.getdeviceproperty(action.id,'name')+'" to "'+action.status+'" after '+action.delay + ' minutes';
      watcher_action_table += '<tr><td><span class="checkbox"><label><input type="checkbox" id="target_action_' + action.id + '" value="' + action.id + ',' + action.status + ',' + action.delay + '"> Change "' + deviceaction.getdeviceproperty(action.id, 'name') + '" to "' + action.status + '" after ' + action.delay + ' minutes</label></span></td></tr>';
    })
    // Update the body with the results of above calculations.
  body = body.replace(/{select_device}/g, device_options);
  body = body.replace(/{action_target_device_list}/g, target_devices);
  body = body.replace(/{watcher_action_table}/g, watcher_action_table);
  body = body.replace(/{selectenabled}/g, sharedfunctions.createdropdown_alphanumeric([
    ['true', 'Yes'],
    ['false', 'No']
  ], selected_watcher.enabled));
  body = body.replace(/{selectactiontrigger}/g, sharedfunctions.createdropdown_alphanumeric([
    ['On'],
    ['Off']
  ], ''));
  body = body.replace(/{action_target_status_list}/g, sharedfunctions.createdropdown_alphanumeric([
    ['On'],
    ['Off']
  ], ''));
  body = body.replace(/{waitminutes}/g, selected_watcher.delay);

  //body = body.replace(/{watcher_actions}/g,watcher_actions);

  if (selected_watcher.autoremoteonschedule == 'true') {
    body = body.replace(/{autoremote_selected}/g, 'checked=checked');
  } else {
    body = body.replace(/{autoremote_selected}/g, '');
  }
  if (selected_watcher.onstatechanged == 'true') {
    body = body.replace(/{onstatechanged_selected}/g, 'checked=checked');
  } else {
    body = body.replace(/{onstatechanged_selected}/g, '');
  }
  if (selected_watcher.oncommandsent == 'true') {
    body = body.replace(/{oncommandsent_selected}/g, 'checked=checked');
  } else {
    body = body.replace(/{oncommandsent_selected}/g, '');
  }

  res.send(template(headline, body, true));
}

exports.get = get;