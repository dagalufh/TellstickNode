function createwatcher(uniqueid) {
    var validdeviceid = $('#Select_Device').val();
    var validaction = $('#Select_Action').val();
    var validsetstatus = $('#Select_Action_After').val();
    var validdelay = $('#WaitTime').val();
    
    // Check for a nuemrical value in duration for Timers
    if ($.isNumeric(validdelay) === false) {
        $('#WaitTime').parent().addClass('has-error');
        $('#respons-modal-body').html('Incorrect value in duration. Needs to be numbers only.');
        $('#myModal').modal('show');
        return false;
    }
    
    if($("#autoremote").prop('checked') == true){
        validautoremote = true;
    }
    
    /*
        this.deviceid = '';
        this.triggerstatus = '';
        this.delay = 0;
        this.setstatus = '';
        this.enabled = 'true';
    
    */
    
    if (typeof(uniqueid) == 'undefined') {
        $.post('/newwatcher',{
            deviceid:validdeviceid,
            triggerstatus:validaction,
            delay:validdelay,
            setstatus:validsetstatus,
            enabled:$('#Select_Enabled').val(),
            autoremoteonschedule:validautoremote
            }, function (data) {
                    $('#respons-modal-body').html(data.message);
                    $('#myModal').modal('show');
                    //window.location.href = '/newschedule';
                    $('#myModal').on('hidden.bs.modal',function (e) {
                        if (data.code == 'ok') {
                            window.location.href='/newwatcher';
                        }
                    });
            }); 
    } else {
        $.post('/editwatcher',{
            deviceid:validdeviceid,
            triggerstatus:validaction,
            delay:validdelay,
            setstatus:validsetstatus,
            enabled:$('#Select_Enabled').val(),
            uniqueid:uniqueid,
            autoremoteonschedule:validautoremote
            }, function (data) {
                $('#respons-modal-body').html(data);
                $('#myModal').modal('show');
                //window.location.href = '/';
                $('#myModal').on('hidden.bs.modal',function (e) {
                    window.location.href='/';
                });
            }); 
    }
}


// Make sure that the user can't select the same state as both trigger and set.
$(function(ready){
    $('#Select_Action').change(function() {
        if($(this).val() == 'On') {
            $('#Select_Action_After').val('Off');       
        }
        if($(this).val() == 'Off') {
            $('#Select_Action_After').val('On');       
        }
    });

    $('#Select_Action_After').change(function() {
        if($(this).val() == 'On') {
            $('#Select_Action').val('Off');       
        }
        if($(this).val() == 'Off') {
            $('#Select_Action').val('On');       
        }
    });  
})