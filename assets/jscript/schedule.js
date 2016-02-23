function createschedule(uniqueid) {
    var validdeviceid = $('#Select_Device').val();
    var validdayofweek = []; // : checked?
    var criteriaarray = [];
    validdayofweek = $('#DayOfWeek:checked').map(function() {
        return this.value;
    }).get();

    var validaction = $('#Select_Action').val();
    
    
    if (validdayofweek.length < 1) {
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
    if($("#runonce").prop('checked') === true){
        validrunonce = true;
    }
    
    if($("#autoremote").prop('checked') === true){
        validautoremote = true;
    }
  
 if ($('#ScheduleType').val() == 'Timer') {
   var validtime = formatTime($('#Time_Timer').val());
    if (validtime === false) {
        // Invalid time provided
        $('#Time').parent().addClass('has-error');
        $('#respons-modal-body').html('Incorrect time provided.');
        $('#myModal').modal('show');
        return false;
    }
   
   
   criteriaarray.push({
      'criteriaid': criteriaarray.length,
      'time': validtime,
      'controller': 'Timer',
      'intervalnotbeforecontroller':'',
      'intervalnotbefore':'',
      'intervalnotaftercontroller':'',
      'intervalnotafter':'',
      //'randomizerfunction': validrandomizerfunction,
      //'randomiser': validrandomizer,
      //'weathergoodfunction': validweathergoodfunction,
      //'weathergoodtime': validweathergood,
      //'weatherbadfunction': validweatherbadfunction,
      //'weatherbadtime': validweatherbad,
      'originaltime': validtime
    })
 } else {
  
   $('input[name^="criteria_"]').each(function() {
  var action = $(this).val().split(',');
    criteriaarray.push({
      'criteriaid': criteriaarray.length,
      'time': action[1],
      'controller': action[0],
      'intervalnotbeforecontroller':action[2],
      'intervalnotbefore':action[3],
      'intervalnotaftercontroller':action[4],
      'intervalnotafter':action[5],
      //'randomizerfunction': validrandomizerfunction,
      //'randomiser': validrandomizer,
      //'weathergoodfunction': validweathergoodfunction,
      //'weathergoodtime': validweathergood,
      //'weatherbadfunction': validweatherbadfunction,
      //'weatherbadtime': validweatherbad,
      'originaltime': action[1]
    })
   })
 }
   if (criteriaarray.length === 0) {
      $('#respons-modal-body').html('<span class="bg-danger">You need to add atleast one criteria.</span>');
      $('#myModal').modal('show');
      return false;    
   }
    
    if (typeof(uniqueid) == 'undefined') {
        $.post('/newschedule',{
            deviceid:validdeviceid,
            dayofweek:validdayofweek,
            action:validaction,
            runonce:validrunonce,
            duration:validduration,
            enabled:$('#Select_Enabled').val(),
            // This section can be removed if information needs to be stored on a per-criteria basis.
            randomizerfunction:validrandomizerfunction,
            randomiser:validrandomizer,
            weathergoodfunction:validweathergoodfunction,
            weathergoodtime:validweathergood,
            weatherbadfunction:validweatherbadfunction,
            weatherbadtime:validweatherbad,
            // End of section
            sendautoremote:validautoremote,
            criterias: criteriaarray}, function (data) {
            $('#respons-modal-body').html(data);
            $('#myModal').modal('show');
            //window.location.href = '/newschedule';
            $('#myModal').on('hidden.bs.modal',function (e) {
                window.location.href='/newschedule';
            });
        }); 
    } else {
        $.post('/editschedule',{
            deviceid:validdeviceid,
            dayofweek:validdayofweek,
            action:validaction,
            runonce:validrunonce,
            duration:validduration,
            uniqueid:uniqueid,
            enabled:$('#Select_Enabled').val(),
            // This section can be removed if information needs to be stored on a per-criteria basis.
            randomizerfunction:validrandomizerfunction,
            randomiser:validrandomizer,
            weathergoodfunction:validweathergoodfunction,
            weathergoodtime:validweathergood,
            weatherbadfunction:validweatherbadfunction,
            weatherbadtime:validweatherbad,
            // End of section
            sendautoremote:validautoremote,
            criterias: criteriaarray}, function (data) {
            $('#respons-modal-body').html(data);
            $('#myModal').modal('show');
            //window.location.href = '/';
            $('#myModal').on('hidden.bs.modal',function (e) {
                window.location.href='/view_schedules';
            });
        }); 
    }
}

function schedule_remove_criteria() {
  $('input[name^="criteria_"]:checked').each(function() {
    $(this).parent().parent().parent().remove();
  });
}

function schedule_add_criteria() {
  var intervalshow = '';
  var validtime = formatTime($('#Time').val());
  if (validtime === false) {
      // Invalid time provided
      $('#Time').parent().addClass('has-error');
      $('#respons-modal-body').html('Incorrect time provided.');
      $('#myModal').modal('show');
      return false;
  }
  var validnotbefore = formatTime($('#IntervalNotBeforeTime').val());
  var validnotafter = formatTime($('#IntervalNotAfterTime').val());
  var interval = $('#Select_Controller_ModifierBefore').val() + ',' + validnotbefore + ',' + $('#Select_Controller_ModifierAfter').val() + ',' + validnotafter;
  intervalshow = ' if time is within the interval of ' + $('#Select_Controller_ModifierBefore').val() + '(' + validnotbefore + ') and ' + $('#Select_Controller_ModifierAfter').val() + '(' + validnotafter + ')';
  $('#schedule_criteria_table TR').last().before('<tr><td><span class="checkbox"><label><input type="checkbox" name="criteria_" value="' + $('#Select_Controller').val() + ',' + validtime + ',' + interval + '">' + $("#Select_Controller option:selected").html() + ' (' + validtime + ')' + intervalshow + '</label></span></td></tr>')
}

function select_all_days() {
  var select_all = true;
  $('input[id^="DayOfWeek"]:checked').each(function() {
    select_all = false;
  })
  
  $('input[id^="DayOfWeek"]').prop('checked',select_all);
}

