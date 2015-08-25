function attemptlogin() { 
    // Do some checking to make sure valid formatted credentials are entered.
    var validUsername = $("#username").val();
    var validPassword = $("#password").val();
    $.post('/login',{username:validUsername,password:validPassword}, function (data) {
        if(data == 'true') {
            window.location.href=window.location.href;
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
        data: {'scheduleid':scheduleid},
        success: function (data) {
            if (data) {
                window.location.href=window.location.href;
            }},
        error: function (data) {alert('Error occured when removing schedule with id: ' + scheduleid);}
    });    
}



function removewatcher(watcherid) {
    $.ajax({
        url: '/removewatcher',
        data: {'watcherid':watcherid},
        success: function (data) {
            if (data) {
                window.location.href=window.location.href;
            }},
        error: function (data) {alert('Error occured when removing watcher with id: ' + watcherid);}
    });  
}

function switchdevicestatus(deviceid, switchto) {
    //var switchto = "on";
    //if ($('#commandbutton_'+deviceid).html() == 'ON') {
    //    switchto = 'off';
    //}
    
    $.ajax({
        url: '/device',
        data: {'deviceid':deviceid,'switchto':switchto},
        success: function (data) {
            //$('#respons-modal-body').html(data);
            //$('#myModal').modal('show');
        },
        error: function (data) {alert('error occured when setting new status: ' + data);
                               console.log(data);}
    });
}

var socket = io.connect();
socket.on('message', function(data){
    //console.log(data.message);
    for(var i=0; i<data.message.length;i++) {
        var device = data.message[i].device.split(':');
        
        if(device[0] == 'Time') {
            if( ($('#Select_Controller').val() == 'Sundown') || ($('#Select_Controller').val() == 'Sunrise') ) {
                $('#Time').val(device[1] + ":" + device[2]);
            }
            if( ($('#Select_Controller_ModifierBefore').val() == 'Sundown') || ($('#Select_Controller_ModifierBefore').val() == 'Sunrise') ) {
                $('#IntervalNotBeforeTime').val(device[1] + ":" + device[2]);
            }
            if( ($('#Select_Controller_ModifierAfter').val() == 'Sundown') || ($('#Select_Controller_ModifierAfter').val() == 'Sunrise') ) {
                $('#IntervalNotAfterTime').val(device[1] + ":" + device[2]);
            }
        } else if(device[0] == 'pausedschedules') {
            $('#schedulestatus').html(device[1]);
            
            if (device[2] == 'true') {
                $('#pauseparagraph').addClass('bg-danger');
                $('#pausebutton').html('Resume schedules');
                
            } else {
                $('#pauseparagraph').removeClass('bg-danger');
                $('#pausebutton').html('Pause schedules');
            }
        } else {
            $('#commandbutton_'+device[0]+'_on').removeClass('btn-success');
            $('#commandbutton_'+device[0]+'_off').removeClass('btn-success');
            $('#commandbutton_'+device[0]+'_dim').removeClass('btn-success');
            
            if (device[1].toLowerCase() == 'on') {
                $('#commandbutton_'+device[0]+'_on').addClass('btn-success');
            }
            if (device[1].toLowerCase() == 'off') {
                $('#commandbutton_'+device[0]+'_off').addClass('btn-success');
            }
            if (device[1].toLowerCase() == 'dim') {
                $('#commandbutton_'+device[0]+'_dim').addClass('btn-success');
            }
            
            
        }
        console.log('Recevied: '  + device[0] + ":" + device[1]);
        
    }
});

$(function(ready){   
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
        
        // Fix so the time is correct to begin with
        //$('#Time').val(formatTime($('#Time').val()));
        
        // If the user changes the controller, the time should change.
        $('#Select_Controller').change(function() {  
            
            if ($(this).val() == 'Time') {
                var currentdate = new Date();
                $('#Time').val(currentdate.getHours() + ":" + currentdate.getMinutes());
                $('#Modificationsdiv').show();
                $('#ModifcationBeforeHeadline').show();
                $('#ModifcationAfterHeadline').show();
                $('#ModifcationBeforeBody').show();
                $('#ModifcationAfterBody').show();
                
                $('#Timerdiv').hide();
                $('#Select_Action').prop('disabled', false);
                $('#Duration').val(1);
            }
            
            if ($(this).val() == 'Sundown') {
                //alert('Sundown');
                // Request from server via socket.io
                socket.emit('request_sun_time', {'controller': 'sunset'});
                $('#Modificationsdiv').show();
                $('#ModifcationBeforeHeadline').show();
                $('#ModifcationAfterHeadline').show();
                $('#ModifcationBeforeBody').show();
                $('#ModifcationAfterBody').show();
                $('#Timerdiv').hide();
                $('#Select_Action').prop('disabled', false);
                $('#Duration').val(1);
            }
            
            if ($(this).val() == 'Sunrise') {
                //alert('Sunrise');
                // Request from server via socket.io
                socket.emit('request_sun_time', {'controller': 'sunrise'});
                $('#Modificationsdiv').show();
                $('#ModifcationBeforeHeadline').show();
                $('#ModifcationAfterHeadline').show();
                $('#ModifcationBeforeBody').show();
                $('#ModifcationAfterBody').show();
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
                $('#Timerdiv').show();
                $('#Select_Action').val('On');
                $('#Select_Action').prop('disabled', true);
                $('#Select_Weather_Good_Time').val(0);
                $('#Select_Weather_Bad_Time').val(0);
                $('#Select_Randomizer_Value').val(0);  
                $('#IntervalNotAfterTime').val('');
                $('#IntervalNotBeforeTime').val('');
                
            }
        });
        
        $('#Select_Controller_ModifierBefore').change(function() {  
            if ($(this).val() == 'None') {
                $('#IntervalNotBeforeTime').val('');
            }
            
            if ($(this).val() == 'Time') {
                var currentdate = new Date();
                var hour = '0'+currentdate.getHours();
                var minutes = '0' + currentdate.getMinutes();
                
                $('#IntervalNotBeforeTime').val(hour.substr(hour.length-2) + ":" + minutes.substr(minutes.length-2));
            }
            
            if ($(this).val() == 'Sundown') {
                socket.emit('request_sun_time', {'controller': 'sunset'});
            }
            
            if ($(this).val() == 'Sunrise') {
                socket.emit('request_sun_time', {'controller': 'sunrise'});
            }
        });
        
        $('#Select_Controller_ModifierAfter').change(function() {  
            if ($(this).val() == 'None') {
                $('#IntervalNotAfterTime').val('');
            }
            
            if ($(this).val() == 'Time') {
                var currentdate = new Date();
                var hour = '0'+currentdate.getHours();
                var minutes = '0' + currentdate.getMinutes();
                
                $('#IntervalNotAfterTime').val(hour.substr(hour.length-2) + ":" + minutes.substr(minutes.length-2));
            }
            
            if ($(this).val() == 'Sundown') {
                socket.emit('request_sun_time', {'controller': 'sunset'});
            }
            
            if ($(this).val() == 'Sunrise') {
                socket.emit('request_sun_time', {'controller': 'sunrise'});
            }
        });
        
        // When the user switches focus from the time input, make sure it was a correct value.
        $('#Time').focusout(function() {
            var correctTime = formatTime($(this).val());
            if (correctTime !== false) {
                $(this).val(correctTime);
                $(this).parent().removeClass('has-error');
            } else {
                $('#Time').parent().addClass('has-error');
            }
        });
        $('#IntervalNotBeforeTime').focusout(function() {
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
        $('#IntervalNotAfterTime').focusout(function() {
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
    window.location.href = window.location.href.substr(0,window.location.href.indexOf('?')) + '?deviceid='+$('#devicetoview').val() + '&scheduletype='+$('#schedulestoview').val();
}

function pause_schedules() {
   $.get('/pauseschedules',function (data) {
       return true;
    }); 
}

function reset_schedules() {
   $.get('/resetschedules',function (data) {
        $('#respons-modal-body').html('All devices are now being returned to their currently scheduled state.');
        $('#myModal').modal('show');
    }); 
}

function save_options() {
    var debugselector = false;
    if($("#debug").prop('checked') == true){
            debugselector = true;
    }
    $.post('/options', {city:$('#city').val(),
                         port:$('#port').val(),
                        doubletapcount:$('#doubletapcount').val(),
                        doubletapseconds:$('#doubletapseconds').val(),
                        weathercodes:$('#weathercodes').val(),
                        autoremote_password:$('#autoremote_password').val(),
                        autoremote_key:$('#autoremote_key').val(),
                        autoremote_message:$('#autoremote_message').val(),
                        debug:debugselector,
                        theme:$('#Select_Theme').val()}, function (data) {
        $('#respons-modal-body').html('Options has been saved.');
        $('#myModal').modal('show');
    });   
    return false;
}

// This function was created by http://stackoverflow.com/users/248343/ocus
function formatTime(time) {
    var result = false, m;
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
        data: {'scheduleid':scheduleid},
        success: function (data) {
            $('#respons-modal-body').html(data);
            $('#myModal').modal('show');
        },
        error: function (data) {
            //$('#respons-modal-body').html('Error occured: ' + data.statusText);
            //$('#myModal').modal('show');
            console.log('Error when showing schedule info: ' + data.statusText);
        }
    }); 
}