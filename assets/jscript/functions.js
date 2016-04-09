function attemptlogin() {
  // Do some checking to make sure valid formatted credentials are entered.
  var validUsername = $("#username").val();
  var validPassword = $("#password").val();
  $.post('/login', {
    username: validUsername,
    password: validPassword
  }, function(data) {
    if (data == 'true') {
      window.location.href = window.location.href;
    } else {
      alert('Incorrect credentials');
    }
  });
  return false;
}

// This function is used for removing schedules 
function removeschedule(scheduleid) {
  $.ajax({
    url: '/removeschedule',
    data: {
      'scheduleid': scheduleid
    },
    success: function(data) {
      if (data) {
        window.location.href = window.location.href;
      }
    },
    error: function(data) {
      alert('Error occured when removing schedule with id: ' + scheduleid);
    }
  });
}

function removewatcher(watcherid) {
  $.ajax({
    url: '/removewatcher',
    data: {
      'watcherid': watcherid
    },
    success: function(data) {
      if (data) {
        window.location.href = window.location.href;
      }
    },
    error: function(data) {
      alert('Error occured when removing watcher with id: ' + watcherid);
    }
  });
}

function switchdevicestatus(deviceid, switchto) {
  //var switchto = "on";
  //if ($('#commandbutton_'+deviceid).html() == 'ON') {
  //    switchto = 'off';
  //}
  $.ajax({
    url: '/device',
    data: {
      'deviceid': deviceid,
      'switchto': switchto
    },
    success: function(data) {
      //$('#respons-modal-body').html(data);
      //$('#myModal').modal('show');
      console.log(data);      
    },
    error: function(data) {
      alert('error occured when setting new status: ' + data);
      console.log(data);
    }
  });
}

var socket = io.connect();
socket.on('message', function(data) {
  //console.log(data.message);
  for (var i = 0; i < data.message.length; i++) {
    var device = data.message[i].device.split(':');

    if (device[0] == 'pausedschedules') {
      $('#schedulestatus').html(device[1]);

      if (device[2] == 'true') {
        $('#pauseparagraph').addClass('bg-danger');
        $('#pausebutton').html('Resume schedules');

      } else {
        $('#pauseparagraph').removeClass('bg-danger');
        $('#pausebutton').html('Pause schedules');
      }
    } else {
      $('#commandbutton_' + device[0] + '_1').removeClass('btn-success');
      $('#commandbutton_' + device[0] + '_2').removeClass('btn-success');

      if (device[1] == '1') {
        $('#commandbutton_' + device[0] + '_1').addClass('btn-success');
      }
      if (device[1] == '2') {
        $('#commandbutton_' + device[0] + '_2').addClass('btn-success');
      }

    }
    console.log('Recevied: ' + device[0] + ":" + device[1]);
  }
});

$(function(ready) {
  
  if ($('#ScheduleType').val() == 'Timer') {
    $('.non_timer').hide();
    $('.for_timer').show();
  } else {
    $('.non_timer').show();
    $('.for_timer').hide();
  }
  
  if ($('#Select_Controller_ModifierBefore').val() == 'None') {
    $('#IntervalNotBeforeTime').attr('disabled', true);
  }
  if ($('#Select_Controller_ModifierBefore').val() == 'None') {
    $('#IntervalNotAfterTime').attr('disabled', true);
  }

  // Make sure we are on newschedule page by checking that a form element exists.
  if ($('#Select_Device').length > 0) {
    if ($('#Select_Controller').val() == 'Timer') {
      $('#Modificationsdiv').hide();
      $('#Timerdiv').show();
      $('#Select_Action').val('On');
      $('#Select_Action').prop('disabled', true);
      $('#Select_Weather_Good_Time').val(0);
      $('#Select_Weather_Bad_Time').val(0);
      $('#Select_Randomizer_Value').val(0);

    }
    
    $('#ScheduleType').change(function() {
      if ($(this).val() == 'Timer') {
        $('.non_timer').hide();
        $('.for_timer').show();
      } else {
        $('.non_timer').show();
        $('.for_timer').hide();
      }
    });

    // Fix so the time is correct to begin with
    //$('#Time').val(formatTime($('#Time').val()));

    // If the user changes the controller, the time should change.
    $(document).on('change','#Select_Controller',function() {

      if ($(this).val() == 'Time') {
        var currentdate = new Date();
        $('#Time').val(currentdate.getHours() + ":" + currentdate.getMinutes());
        $('#Modificationsdiv').show();
        $('#ModifcationBeforeHeadline').show();
        $('#ModifcationAfterHeadline').show();
        $('#ModifcationBeforeBody').show();
        $('#ModifcationAfterBody').show();
        $('.non_timer').show();
        $('#Timerdiv').hide();
        $('#Select_Action').prop('disabled', false);
        $('#Duration').val(1);
      }

      if ($(this).val() == 'Sundown') {
        //alert('Sundown');
        // Request from server via socket.io
        //socket.emit('request_sun_time', {
        //  'controller': 'sunset'
        //});
        getTimeFromServer('sunset',$('#Time'));
        
        $('#Modificationsdiv').show();
        $('#ModifcationBeforeHeadline').show();
        $('#ModifcationAfterHeadline').show();
        $('#ModifcationBeforeBody').show();
        $('#ModifcationAfterBody').show();
        $('.non_timer').show();
        $('#Timerdiv').hide();
        $('#Select_Action').prop('disabled', false);
        $('#Duration').val(1);
      }

      if ($(this).val() == 'Sunrise') {
        //alert('Sunrise');
        // Request from server via socket.io
        //socket.emit('request_sun_time', {
        //  'controller': 'sunrise'
        //});
        
        getTimeFromServer('sunrise',$('#Time'));
        
        $('#Modificationsdiv').show();
        $('#ModifcationBeforeHeadline').show();
        $('#ModifcationAfterHeadline').show();
        $('#ModifcationBeforeBody').show();
        $('#ModifcationAfterBody').show();
        $('.non_timer').show();
        $('#Timerdiv').hide();
        $('#Select_Action').prop('disabled', false);
        $('#Duration').val(1);
      }
      if ($(this).val() == 'Timer') {
        $('#Modificationsdiv').hide();
        $('#ModifcationBeforeHeadline').hide();
        $('#ModifcationAfterHeadline').hide();
        $('#ModifcationBeforeBody').hide();
        $('#ModifcationAfterBody').hide();
        $('.non_timer').hide();
        $('#Timerdiv').show();
        $('#Select_Action').val('On');
        $('#Select_Action').prop('disabled', true);
        $('#Select_Weather_Good_Time').val(0);
        $('#Select_Weather_Bad_Time').val(0);
        $('#Select_Randomizer_Value').val(0);
        $('#IntervalNotAfterTime').val('');
        $('#IntervalNotBeforeTime').attr('disabled', true);
        $('#IntervalNotBeforeTime').val('');
        $('#IntervalNotAfterTime').attr('disabled', true);
        $('#Select_Controller_ModifierBefore').val('None');
        $('#Select_Controller_ModifierAfter').val('None');

      }
    });

    $(document).on('change','#Select_Controller_ModifierBefore',function() {
    //$('#Select_Controller_ModifierBefore').change(function() {
      
      if ($(this).val() == 'None') {
        $('#IntervalNotBeforeTime').val('');
        $('#IntervalNotBeforeTime').attr('disabled', true);
      }

      if ($(this).val() == 'Time') {
        $('#IntervalNotBeforeTime').attr('disabled', false);
        var currentdate = new Date();
        var hour = '0' + currentdate.getHours();
        var minutes = '0' + currentdate.getMinutes();

        $('#IntervalNotBeforeTime').val(hour.substr(hour.length - 2) + ":" + minutes.substr(minutes.length - 2));
      }

      if ($(this).val() == 'Sundown') {
        $('#IntervalNotBeforeTime').attr('disabled', false);
        getTimeFromServer('sunset',$('#IntervalNotBeforeTime'));
      }

      if ($(this).val() == 'Sunrise') {
        $('#IntervalNotBeforeTime').attr('disabled', false);
        getTimeFromServer('sunrise',$('#IntervalNotBeforeTime'));
      }
      
      if ($(this).val().indexOf('criteria') != -1) {
        var criteriatime = $("#Select_Controller_ModifierBefore option[value='"+ $(this).val() +"']").text();
        $('#IntervalNotBeforeTime').attr('disabled', true);
        $('#IntervalNotBeforeTime').val(criteriatime.substring(criteriatime.lastIndexOf('(')+1, criteriatime.lastIndexOf(')')));
      }
    });
    
    $(document).on('change','#Select_Controller_ModifierAfter',function() {
   // $('#Select_Controller_ModifierAfter').change(function() {
      if ($(this).val() == 'None') {
        $('#IntervalNotAfterTime').val('');
        $('#IntervalNotAfterTime').attr('disabled', true);
      }

      if ($(this).val() == 'Time') {
        $('#IntervalNotAfterTime').attr('disabled', false);
        var currentdate = new Date();
        var hour = '0' + currentdate.getHours();
        var minutes = '0' + currentdate.getMinutes();

        $('#IntervalNotAfterTime').val(hour.substr(hour.length - 2) + ":" + minutes.substr(minutes.length - 2));
      }

      if ($(this).val() == 'Sundown') {
        $('#IntervalNotAfterTime').attr('disabled', false);
        getTimeFromServer('sunset',$('#IntervalNotAfterTime'));
      }

      if ($(this).val() == 'Sunrise') {
        $('#IntervalNotAfterTime').attr('disabled', false);
        getTimeFromServer('sunrise',$('#IntervalNotAfterTime'));
      }
      
      if ($(this).val().indexOf('criteria') != -1) {
        var criteriatime = $("#Select_Controller_ModifierAfter option[value='"+ $(this).val() +"']").text();
        $('#IntervalNotAfterTime').attr('disabled', true);
        $('#IntervalNotAfterTime').val(criteriatime.substring(criteriatime.lastIndexOf('(')+1, criteriatime.lastIndexOf(')')));
      }
    });

    // When the user switches focus from the time input, make sure it was a correct value.
    $(document).on('focusout','#Time',function() {
    //$('#Time').focusout(function() {
      var correctTime = formatTime($(this).val());
      if (correctTime !== false) {
        $(this).val(correctTime);
        $(this).parent().removeClass('has-error');
      } else {
        $('#Time').parent().addClass('has-error');
      }
    });
    
    $(document).on('focusout','#Time_Timer',function() {
    //$('#Time_Timer').focusout(function() {
      var correctTime = formatTime($(this).val());
      if (correctTime !== false) {
        $(this).val(correctTime);
        $(this).parent().removeClass('has-error');
      } else {
        $('#Time_Timer').parent().addClass('has-error');
      }
    });
    
    $(document).on('focusout','#IntervalNotBeforeTime',function() {
    //$('#IntervalNotBeforeTime').focusout(function() {
      if ($(this).val().length > 0) {
        var correctTime = formatTime($(this).val());
        if (correctTime !== false) {
          $(this).val(correctTime);
          $(this).parent().removeClass('has-error');
        } else {
          $('#IntervalNotBeforeTime').parent().addClass('has-error');
        }
      } else {
        $(this).parent().removeClass('has-error');
      }
    });
    $(document).on('focusout','#IntervalNotAfterTime',function() {
    //$('#IntervalNotAfterTime').focusout(function() {
      if ($(this).val().length > 0) {
        var correctTime = formatTime($(this).val());
        if (correctTime !== false) {
          $(this).val(correctTime);
          $(this).parent().removeClass('has-error');
        } else {
          $('#IntervalNotAfterTime').parent().addClass('has-error');
        }
      } else {
        $(this).parent().removeClass('has-error');
      }
    });


  }
});

function filter() {
  window.location.href = window.location.href.substr(0, window.location.href.indexOf('?')) + '?deviceid=' + $('#devicetoview').val() + '&scheduletype=' + $('#schedulestoview').val();
}

function pause_schedules() {
  $.get('/pauseschedules', function(data) {
    return true;
  });
}

function reset_schedules() {
  $.get('/resetschedules', function(data) {
    $('#respons-modal-body').html('All devices are now being returned to their currently scheduled state.');
    $('#myModal').modal('show');
  });
}


// This function was created by http://stackoverflow.com/users/248343/ocus
function formatTime(time) {
  var result = false,
    m;
  var re = /^\s*([01]?\d|2[0-3]):?([0-5]\d)\s*$/;
  if ((m = time.match(re))) {
    result = (m[1].length == 2 ? "" : "0") + m[1] + ":" + m[2];
  }
  return result;
}

function showscheduleinfo(scheduleid) {
  $('#respons-modal-body').html('Fetching schedule data.');
  $('#myModal').modal('show');
  $.ajax({
    url: '/showscheduleinfo',
    data: {
      'scheduleid': scheduleid
    },
    success: function(data) {
      $('#respons-modal-body').html(data);
      $('#myModal').modal('show');
    },
    error: function(data) {
      //$('#respons-modal-body').html('Error occured: ' + data.statusText);
      //$('#myModal').modal('show');
      console.log('Error when showing schedule info: ' + data.statusText);
    }
  });
}

function showwatcherinfo(watcherid) {
  $('#respons-modal-body').html('Fetching watcher data.');
  $('#myModal').modal('show');
  $.ajax({
    url: '/showwatcherinfo',
    data: {
      'watcherid': watcherid
    },
    success: function(data) {
      $('#respons-modal-body').html(data);
      $('#myModal').modal('show');
    },
    error: function(data) {
      //$('#respons-modal-body').html('Error occured: ' + data.statusText);
      //$('#myModal').modal('show');
      console.log('Error when showing watcher info: ' + data.statusText);
    }
  });
}

function getTimeFromServer(controller, target) {
  console.log('here');
  $.ajax({
    url: '/gettime?controller=' + controller,
    success: function (data) {
      console.log(data);
      target.val(data);
    },
    error: function (data) {
      console.log('error');
      console.log(data);
    }
  });
}

function modal_error() {
  $('#myModalLabel').html('Error Occured');
  $('#myModalLabel').parent().addClass('error');
  $('#respons-modal-body').html('');
  //$('#myModalLabel').parent().removeClass('modal-header');
  $('#respons-modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
}

function modal_notification() {
  $('#myModalLabel').parent().removeClass('error');
  //$('#myModalLabel').parent().addClass('modal-header');
  $('#myModalLabel').html('Notification');
  $('#respons-modal-body').html('');
  $('#respons-modal-footer').html('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
}

function sortNumber(a,b) {
    return a - b;
}