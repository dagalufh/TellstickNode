function createwatcher(uniqueid) {
  var validdeviceid = $('#Select_Device').val();
  var validaction = $('#Select_Action').val();
  //var validsetstatus = $('#Select_Action_After').val();
  var validautoremote = $("#autoremote").prop('checked');
  // Check for a nuemrical value in duration for Timers
  var targetactions = [];
  $('input[id^="target_action_"]').each(function() {
    var action = $(this).val().split(',');
    targetactions.push({
      'id': action[0],
      'status': action[1].toLocaleLowerCase(),
      'delay': action[2]
    })
  });

  if (targetactions.length === 0) {
    $('#respons-modal-body').html('You need to have atleast one action in the list of actions to occur when watcher is triggered.');
    $('#myModal').modal('show');
    return false;
  }

  if (typeof(uniqueid) == 'undefined') {
    $.post('/newwatcher', {
      deviceid: validdeviceid,
      triggerstatus: validaction,
      actions: targetactions,
      enabled: $('#Select_Enabled').val(),
      autoremoteonschedule: validautoremote
    }, function(data) {
      $('#respons-modal-body').html(data.message);
      $('#myModal').modal('show');
      //window.location.href = '/newschedule';
      $('#myModal').on('hidden.bs.modal', function(e) {
        if (data.code == 'ok') {
          window.location.href = '/newwatcher';
        }
      });
    });
  } else {
    $.post('/editwatcher', {
      deviceid: validdeviceid,
      triggerstatus: validaction,
      actions: targetactions,
      enabled: $('#Select_Enabled').val(),
      uniqueid: uniqueid,
      autoremoteonschedule: validautoremote
    }, function(data) {
      $('#respons-modal-body').html(data);
      $('#myModal').modal('show');
      //window.location.href = '/';
      $('#myModal').on('hidden.bs.modal', function(e) {
        window.location.href = '/view_watchers';
      });
    });
  }
}

function watcher_remove_action() {
  $('input[id^="target_action_"]:checked').each(function() {
    $(this).parent().parent().remove();
  });
}

function watcher_add_action() {
  if (($.isNumeric($('#action_target_wait').val()) === false) && ($('#action_target_wait').val() >= 0) && ($('#action_target_wait').val() <= 1380)) {
    $('#action_target_wait').parent().addClass('has-error');
    $('#respons-modal-body').html('Incorrect value in duration. Needs to be numbers only.');
    $('#myModal').modal('show');
    return false;
  }
  $('#watcher_actions_table TR').last().before('<tr><td><span class="checkbox"><label><input type="checkbox" id="target_action_' + $('#action_target_device').val() + '" value="' + $('#action_target_device').val() + ',' + $('#action_target_status').val() + ',' + $('#action_target_wait').val() + '"> Change "' + $('#action_target_device option:selected').text() + '" to "' + $('#action_target_status').val() + '" after ' + $('#action_target_wait').val() + ' minutes</label></span></td></tr>')
}