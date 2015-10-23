function createschedule(uniqueid) {
    var validdeviceid = $('#Select_Device').val();
    var validdayofweek = []; // : checked?
    validdayofweek = $('#DayOfWeek:checked').map(function() {
        return this.value;
    }).get();
    var validcontroller = $('#Select_Controller').val();
    var validaction = $('#Select_Action').val();
    
    var validtime = formatTime($('#Time').val());
    if (validtime === false) {
        // Invalid time provided
        $('#Time').parent().addClass('has-error');
        $('#respons-modal-body').html('Incorrect time provided.');
        $('#myModal').modal('show');
        return false;
    }
    
    var validnotbefore = '';
    var validnotafter = '';
    if (validcontroller != 'Timer') {
        if ($('#IntervalNotBeforeTime').val().length > 0) {
            validnotbefore = formatTime($('#IntervalNotBeforeTime').val());
            if (validnotbefore === false) {
                // Invalid time provided
                $('#IntervalNotBeforeTime').parent().addClass('has-error');
                $('#respons-modal-body').html('Incorrect time provided for trigger time before.');
                $('#myModal').modal('show');
                return false;
            }
        }
        
        if ($('#IntervalNotAfterTime').val().length > 0) {
            validnotafter = formatTime($('#IntervalNotAfterTime').val());
            if (validnotafter === false) {
                // Invalid time provided
                $('#IntervalNotAfterTime').parent().addClass('has-error');
                $('#respons-modal-body').html('Incorrect time provided for trigger time after.');
                $('#myModal').modal('show');
                return false;
            }
        }
    }
    
    
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
    if($("#runonce").prop('checked') == true){
        validrunonce = true;
    }
    
    if($("#autoremote").prop('checked') == true){
        validautoremote = true;
    }
    
    
    
    // Check for a nuemrical value in duration for Timers
    if ( ($.isNumeric(validduration) === false) && (validcontroller == 'Timer') ) {
        $('#Duration').parent().addClass('has-error');
        $('#respons-modal-body').html('Incorrect value in duration. Needs to be numbers only.');
        $('#myModal').modal('show');
        return false;
    }
    
    if (typeof(uniqueid) == 'undefined') {
        $.post('/newschedule',{
            deviceid:validdeviceid,
            dayofweek:validdayofweek,
            controller:validcontroller,
            action:validaction,
            time:validtime,
            randomizerfunction:validrandomizerfunction,
            randomiser:validrandomizer,
            weathergoodfunction:validweathergoodfunction,
            weathergoodtime:validweathergood,
            weatherbadfunction:validweatherbadfunction,
            weatherbadtime:validweatherbad,
            runonce:validrunonce,
            duration:validduration,
            enabled:$('#Select_Enabled').val(),
            intervalnotbefore:validnotbefore,
            intervalnotafter:validnotafter,
            intervalnotbeforecontroller:$('#Select_Controller_ModifierBefore').val(),
            intervalnotaftercontroller:$('#Select_Controller_ModifierAfter').val(),
            sendautoremote:validautoremote}, function (data) {
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
            controller:validcontroller,
            action:validaction,
            time:validtime,
            randomizerfunction:validrandomizerfunction,
            randomiser:validrandomizer,
            weathergoodfunction:validweathergoodfunction,
            weathergoodtime:validweathergood,
            weatherbadfunction:validweatherbadfunction,
            weatherbadtime:validweatherbad,
            runonce:validrunonce,
            duration:validduration,
            uniqueid:uniqueid,
            enabled:$('#Select_Enabled').val(),
            intervalnotbefore:validnotbefore,
            intervalnotafter:validnotafter,
            intervalnotbeforecontroller:$('#Select_Controller_ModifierBefore').val(),
            intervalnotaftercontroller:$('#Select_Controller_ModifierAfter').val(),
            sendautoremote:validautoremote}, function (data) {
            $('#respons-modal-body').html(data);
            $('#myModal').modal('show');
            //window.location.href = '/';
            $('#myModal').on('hidden.bs.modal',function (e) {
                window.location.href='/view_schedules';
            });
        }); 
    }
}