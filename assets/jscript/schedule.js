function createschedule(uniqueid) {
  var validdeviceid = $('#Select_Device').val();
  var validdayofweek = []; // : checked?
  var criteriaarray = [];
  validdayofweek = $('#DayOfWeek:checked').map(function() {
    return this.value;
  }).get();

  var validaction = $('#Select_Action').val();


  if (validdayofweek.length < 1) {
    modal_error();
    $('#respons-modal-body').html('Select atleast one day of the week.');
    $('#myModal').modal('show');
    return false;
  }

  var validrandomizerfunction = $('#Select_Randomizer').val();
  var validrandomizer = $('#Select_Randomizer_Value').val();
  var validweathergoodfunction = $('#Select_Weather_Good').val();
  var validweathergood = $('#Select_Weather_Good_Time').val();
  var validweatherbadfunction = $('#Select_Weather_Bad').val();
  var validweatherbad = $('#Select_Weather_Bad_Time').val();
  var validrunonce = false;
  var validautoremote = false;
  var validduration = $('#Duration').val();
  if ($("#runonce").prop('checked') === true) {
    validrunonce = true;
  }

  if ($("#autoremote").prop('checked') === true) {
    validautoremote = true;
  }

  if ($('#ScheduleType').val() == 'Timer') {
    var validtime = formatTime($('#Time_Timer').val());
    if (validtime === false) {
      // Invalid time provided
      modal_error();
      $('#Time').parent().addClass('has-error');
      $('#respons-modal-body').html('Incorrect time provided.');
      $('#myModal').modal('show');
      return false;
    }


    criteriaarray.push({
      'criteriaid': criteriaarray.length,
      'time': validtime,
      'controller': 'Timer',
      'intervalnotbeforecontroller': '',
      'intervalnotbefore': '',
      'intervalnotaftercontroller': '',
      'intervalnotafter': '',
      //'randomizerfunction': validrandomizerfunction,
      //'randomiser': validrandomizer,
      //'weathergoodfunction': validweathergoodfunction,
      //'weathergoodtime': validweathergood,
      //'weatherbadfunction': validweatherbadfunction,
      //'weatherbadtime': validweatherbad,
      'originaltime': validtime,
    });
  } else {

    $('input[name^="criteria_"]').each(function() {
      var action = $(this).val().split(',');
      criteriaarray.push({
        'criteriaid': action[0],
        'time': action[2],
        'controller': action[1],
        'intervalnotbeforecontroller': action[3],
        'intervalnotbefore': action[4],
        'intervalnotaftercontroller': action[5],
        'intervalnotafter': action[6],
        //'randomizerfunction': validrandomizerfunction,
        //'randomiser': validrandomizer,
        //'weathergoodfunction': validweathergoodfunction,
        //'weathergoodtime': validweathergood,
        //'weatherbadfunction': validweatherbadfunction,
        //'weatherbadtime': validweatherbad,
        'originaltime': action[2],
        'disablemodifiers': action[7]
      });
    });
  }
  if (criteriaarray.length === 0) {
    modal_error();
    $('#respons-modal-body').html('<span class="bg-danger">You need to add atleast one criteria.</span>');
    $('#myModal').modal('show');
    return false;
  }

  if (typeof(uniqueid) == 'undefined') {
    $.post('/newschedule', {
      deviceid: validdeviceid,
      dayofweek: validdayofweek,
      action: validaction,
      runonce: validrunonce,
      duration: validduration,
      enabled: $('#Select_Enabled').val(),
      // This section can be removed if information needs to be stored on a per-criteria basis.
      randomizerfunction: validrandomizerfunction,
      randomiser: validrandomizer,
      weathergoodfunction: validweathergoodfunction,
      weathergoodtime: validweathergood,
      weatherbadfunction: validweatherbadfunction,
      weatherbadtime: validweatherbad,
      // End of section
      sendautoremote: validautoremote,
      criterias: criteriaarray
    }, function(data) {
      modal_notification();
      $('#respons-modal-body').html(data);
      $('#myModal').modal('show');
      //window.location.href = '/newschedule';
      $('#myModal').on('hidden.bs.modal', function(e) {
        window.location.href = '/newschedule';
      });
    });
  } else {
    $.post('/editschedule', {
      deviceid: validdeviceid,
      dayofweek: validdayofweek,
      action: validaction,
      runonce: validrunonce,
      duration: validduration,
      uniqueid: uniqueid,
      enabled: $('#Select_Enabled').val(),
      // This section can be removed if information needs to be stored on a per-criteria basis.
      randomizerfunction: validrandomizerfunction,
      randomiser: validrandomizer,
      weathergoodfunction: validweathergoodfunction,
      weathergoodtime: validweathergood,
      weatherbadfunction: validweatherbadfunction,
      weatherbadtime: validweatherbad,
      // End of section
      sendautoremote: validautoremote,
      criterias: criteriaarray
    }, function(data) {
      modal_notification();
      $('#respons-modal-body').html(data);
      $('#myModal').modal('show');
      //window.location.href = '/';
      $('#myModal').on('hidden.bs.modal', function(e) {
        window.location.href = '/view_schedules';
      });
    });
  }
}

function schedule_remove_criteria() {
  $('input[name^="criteria_"]:checked').each(function() {
    $(this).parent().parent().parent().parent().remove();
    var criteria = $(this).val().split(',');

    $("#Select_Controller_ModifierBefore option[value^='criteriaid:" + criteria[0] + "']").each(function() {
      $(this).remove();
    });
    $("#Select_Controller_ModifierAfter option[value^='criteriaid:" + criteria[0] + "']").each(function() {
      $(this).remove();
    });

    $('input[name^="criteria_"]').each(function() {
      var action = $(this).val().split(',');

      if (action[3].indexOf('criteriaid:' + criteria[0]) != -1) {
        action[3] = 'None';
        action[4] = 'false';
      }
      if (action[5].indexOf('criteriaid:' + criteria[0]) != -1) {
        action[5] = 'None';
        action[6] = 'false';
      }

      var validdisablemodification = false;

      var modifiers = 'enabled';
      if (action[7] === "true") {
        validdisablemodification = true;
        modifiers = 'disabled';
      }

      var interval = action[3] + ',' + action[4] + ',' + action[5] + ',' + action[6] + ',' + validdisablemodification;

      //$(this).val(action[0] + ',' + action[1] + ',' + action[2] + ',' + interval)

      //$(this).parent().children()[1].html('ID: ' + action[0] + ')' + $("#Select_Controller option[value='" + action[1] + "']").text() + ' (' + action[2] + ')' + intervalshow);

      var intervalshow = ' if time is within the interval of ' + action[3] + '(' + action[4] + ') and ' + action[5] + '(' + action[6] + '). Modifiers are ' + modifiers;
      $(this).parent().html('<input type="checkbox" name="criteria_" value="' + action[0] + ',' + action[1] + ',' + action[2] + ',' + interval + '"> (ID: ' + action[0] + ')' + $("#Select_Controller option[value='" + action[1] + "']").text() + ' (' + action[2] + ')' + intervalshow);
    });

  });
}

function schedule_add_criteria() {
  var intervalshow = '';
  var validdisablemodification = false;

  var modifiers = 'enabled';
  var validtime = formatTime($('#Time').val());
  if (validtime === false) {
    // Invalid time provided
    modal_error();
    $('#Time').parent().addClass('has-error');
    $('#respons-modal-body').html('Incorrect time provided.');
    $('#myModal').modal('show');
    return false;
  }

  if ($("#disablemodification").prop('checked') === true) {
    validdisablemodification = true;
    modifiers = 'disabled';
  }

  var validnotbefore = formatTime($('#IntervalNotBeforeTime').val());
  var validnotafter = formatTime($('#IntervalNotAfterTime').val());

  // Find next available ID for the criteria
  var currentIDs = [];
  $('input[name^="criteria_"]').each(function() {
    var criteria = $(this).val().split(',');
    currentIDs.push(criteria[0]);
  });
  currentIDs.sort(sortNumber);
  var NextAvailableCriteriaID = 0;

  currentIDs.forEach(function(ID) {
    // console.log(ID + '==' + NextAvailableCriteriaID);
    if (ID == NextAvailableCriteriaID) {
      // console.log('Match, Increasing NextAvailableCriteriaID by one');
      NextAvailableCriteriaID++;
    }
  });
  //console.log(NextAvailableCriteriaID);


  var interval = $('#Select_Controller_ModifierBefore').val() + ',' + validnotbefore + ',' + $('#Select_Controller_ModifierAfter').val() + ',' + validnotafter + ',' + validdisablemodification;

  $('#Select_Controller_ModifierBefore').append($('<option/>', {
    value: 'criteriaid:' + NextAvailableCriteriaID,
    text: 'Criteria (ID: ' + NextAvailableCriteriaID + ') ' + $('#Select_Controller').val() + '(' + validtime + ')'
  }));
  $('#Select_Controller_ModifierAfter').append($('<option/>', {
    value: 'criteriaid:' + NextAvailableCriteriaID,
    text: 'Criteria (ID: ' + NextAvailableCriteriaID + ') ' + $('#Select_Controller').val() + '(' + validtime + ')'
  }));

  intervalshow = ' if time is within the interval of ' + $('#Select_Controller_ModifierBefore').val() + '(' + validnotbefore + ') and ' + $('#Select_Controller_ModifierAfter').val() + '(' + validnotafter + '). Modifiers are ' + modifiers;
  $('#schedule_criteria_table TR').last().before('<tr><td class="td-small"><button class="btn btn-default btn-sm" onclick="criteria_modal(\''+ NextAvailableCriteriaID +'\')">Edit</button></td><td><span class="checkbox"><label><input type="checkbox" name="criteria_" value="' + NextAvailableCriteriaID + ',' + $('#Select_Controller').val() + ',' + validtime + ',' + interval + '"> (ID: ' + NextAvailableCriteriaID + ')' + $("#Select_Controller option:selected").html() + ' (' + validtime + ')' + intervalshow + '</label></span></td></tr>');

  $('#IntervalNotBeforeTime').val('');
  $('#IntervalNotAfterTime').val('');
  $("#Select_Controller_ModifierAfter").val("None");
  $("#Select_Controller_ModifierBefore").val("None");
  $('#myModal').modal('hide');
}

function schedule_edit_criteria(criteriaid) {
  $('input[name^="criteria_"]').each(function() {
    var criteria = $(this).val().split(',');
    if (criteriaid == criteria[0]) {

      var intervalshow = '';
      var validdisablemodification = false;

      var modifiers = 'enabled';
      var validtime = formatTime($('#Time').val());
      if (validtime === false) {
        // Invalid time provided
        modal_error();
        $('#Time').parent().addClass('has-error');
        $('#respons-modal-body').html('Incorrect time provided.');
        $('#myModal').modal('show');
        return false;
      }

      if ($("#disablemodification").prop('checked') === true) {
        validdisablemodification = true;
        modifiers = 'disabled';
      }

      var validnotbefore = formatTime($('#IntervalNotBeforeTime').val());
      var validnotafter = formatTime($('#IntervalNotAfterTime').val());

      var interval = $('#Select_Controller_ModifierBefore').val() + ',' + validnotbefore + ',' + $('#Select_Controller_ModifierAfter').val() + ',' + validnotafter + ',' + validdisablemodification;

      //$('#Select_Controller_ModifierBefore').append($('<option/>', {
      //  value: 'criteriaid:' + NextAvailableCriteriaID,
      //  text: 'Criteria (ID: ' + NextAvailableCriteriaID + ') ' + $('#Select_Controller').val() + '(' + validtime + ')'
      //}));

      //$('#Select_Controller_ModifierAfter').append($('<option/>', {
      //  value: 'criteriaid:' + NextAvailableCriteriaID,
      //  text: 'Criteria (ID: ' + NextAvailableCriteriaID + ') ' + $('#Select_Controller').val() + '(' + validtime + ')'
      //}));

      intervalshow = ' if time is within the interval of ' + $('#Select_Controller_ModifierBefore').val() + '(' + validnotbefore + ') and ' + $('#Select_Controller_ModifierAfter').val() + '(' + validnotafter + '). Modifiers are ' + modifiers;
      //$('#schedule_criteria_table TR').last().before('<tr><td><span class="checkbox"><label><input type="checkbox" name="criteria_" value="' + NextAvailableCriteriaID + ',' + $('#Select_Controller').val() + ',' + validtime + ',' + interval + '"> (ID: ' + NextAvailableCriteriaID + ')' + $("#Select_Controller option:selected").html() + ' (' + validtime + ')' + intervalshow + '</label></span></td></tr>');
      $(this).parent().html('<input type="checkbox" name="criteria_" value="' + criteriaid + ',' + $('#Select_Controller').val() + ',' + validtime + ',' + interval + '"> (ID: ' + criteriaid + ')' + $("#Select_Controller option:selected").html() + ' (' + validtime + ')' + intervalshow);
    }
  });
  $('#myModal').modal('hide');
}

function select_all_days() {
  var select_all = true;
  $('input[id^="DayOfWeek"]:checked').each(function() {
    select_all = false;
  });

  $('input[id^="DayOfWeek"]').prop('checked', select_all);
}


function criteria_modal(criteriaid) {
  // Parameter criteriaid decides if it's an edit or a new one
  var headline = "Edit ";
  $('#respons-modal-footer').html('<button class="btn btn-default btn-sm" onclick="schedule_edit_criteria(' + criteriaid + ');">Save Changes</button> <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
  if (typeof(criteriaid) == 'undefined') {
    headline = "Add ";
    $('#respons-modal-footer').html('<button class="btn btn-default btn-sm" onclick="schedule_add_criteria();">Add action to list</button> <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
  }

  $('#myModalLabel').parent().removeClass('error');
  //$('#myModalLabel').parent().addClass('modal-header');
  $('#myModalLabel').html(headline + 'Criteria');
  var content = [
    // Criterias for STANDARD SCHEDULES

    '<div class="panel-body non_timer">',
    '<div class="form-group">',
    '<label for="Select_Controller">Controller</label>',
    '<select id="Select_Controller" class="form-control input-sm">',
    '<option value="Time">Specific Time',
    '<option value="Sundown" title="Adjust to sundown time" {Sundown}>Sundown',
    '<option value="Sunrise" title="Adjust to the time of sunrise" {Sunrise}>Sunrise',
    '</select>',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
    '<div class="form-group">',
    '<label for="Time">Time</label>',
    '<input type="text" class="form-control input-sm" id="Time" placeholder="(HH:MM)24H" value="{initaltime}">',
    '</div>',
    // INTERVALLS BEGIN       

    '<div class="form-group non_timer">',
    '<label for="Select_Controller_ModifierBefore">Do not trigger before</label>',
    '<select id="Select_Controller_ModifierBefore" class="form-control input-sm">',
    '<Option value="None">None',
    '<Option value="Time">Specific Time',
    '<Option value="Sundown">Sundown',
    '<Option value="Sunrise">Sunrise',
    '</select><input type="text" class="form-control input-sm" id="IntervalNotBeforeTime" placeholder="(HH:MM)24H" value="" disabled>',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',

    '<div class="form-group non_timer">',
    '<label for="Select_Controller_ModifierAfter">Do not trigger after</label>',
    '<select id="Select_Controller_ModifierAfter" class="form-control input-sm">',
    '<Option value="None">None',
    '<Option value="Time">Specific Time',
    '<Option value="Sundown">Sundown',
    '<Option value="Sunrise">Sunrise',
    '</select><input type="text" class="form-control input-sm" id="IntervalNotAfterTime" placeholder="(HH:MM)24H" value="" disabled>',
    '<p class="text-info">{ControllerMessage}</p>',
    '</div>',
    // INTERVALLS END       
    '<div class="form-group">',
    '<div class="checkbox">',
    '<label><input type="checkbox" id="disablemodification" Value="disablemodification" class="input-sm">Disable trigger time modifications for this criteria.</label>',
    '</div>',
    '</div>'
  ];
  content = content.join('\n')
  content = content.replace(/{ControllerMessage}/g, $('#ControllerMessage').val());

  $('#respons-modal-body').html(content);
  var currentdate = new Date();
  $('#Time').val(currentdate.getHours() + ":" + currentdate.getMinutes());


  $('input[name^="criteria_"]').each(function() {
    var criteria = $(this).val().split(',');

    if (criteriaid == criteria[0]) {
      $('#Select_Controller').val(criteria[1]);
      $('#Time').val(criteria[2]);
      $('#Select_Controller_ModifierBefore').val(criteria[3]);
      $('#IntervalNotBeforeTime').val(criteria[4]);
      $('#Select_Controller_ModifierAfter').val(criteria[5]);
      $('#IntervalNotAfterTime').val(criteria[6]);
      if (criteria[7] == 'true') {
        $('#disablemodification').prop('checked', true);
      } else {
        $('#disablemodification').prop('checked', false);
      }

    } else {
      $('#Select_Controller_ModifierBefore').append($('<option/>', {
        value: 'criteriaid:' + criteria[0],
        text: 'Criteria (ID: ' + criteria[0] + ') ' + $('#Select_Controller').val() + '(' + criteria[2] + ')'
      }));

      $('#Select_Controller_ModifierAfter').append($('<option/>', {
        value: 'criteriaid:' + criteria[0],
        text: 'Criteria (ID: ' + criteria[0] + ') ' + $('#Select_Controller').val() + '(' + criteria[2] + ')'
      }));
    }
  });

  $('#myModal').modal('show');
}