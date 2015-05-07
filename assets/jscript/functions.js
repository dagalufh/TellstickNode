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
        $('#Time').addClass('bg-danger');
        $('#respons-modal-body').html('Incorrect time provided.');
        $('#myModal').modal('show');
        return false;
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
    var validduration = $('#Duration').val();
    if($("#runonce").prop('checked') == true){
        validrunonce = true;
    }
    
    // Check for a nuemrical value in duration for Timers
    if ( ($.isNumeric(validduration) === false) && (validcontroller == 'Timer') ) {
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
            duration:validduration}, function (data) {
            $('#respons-modal-body').html(data);
            $('#myModal').modal('show');
            window.location.href = '/newschedule';
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
            uniqueid:uniqueid}, function (data) {
            $('#respons-modal-body').html(data);
            $('#myModal').modal('show');
            window.location.href = '/';
        }); 
    }
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

function switchdevicestatus(deviceid) {
    var switchto = "on";
    if ($('#commandbutton_'+deviceid).html() == 'ON') {
        switchto = 'off';
    }
    
    $.ajax({
        url: '/device',
        data: {'deviceid':deviceid,'switchto':switchto},
        success: function (data) {console.log(data);},
        error: function (data) {alert('error occured when setting new status: ' + data);}
    });
}

var socket = io.connect();
socket.on('message', function(data){
    //console.log(data.message);
    for(var i=0; i<data.message.length;i++) {
        var device = data.message[i].device.split(':');
        
        if(device[0] == 'Time') {
            $('#Time').val(device[1] + ":" + device[2]);
        } else if(device[0] == 'pausedschedules') {
            $('#schedulestatus').html(device[1]);
        } else {
            $('#commandbutton_'+device[0]).html(device[1]);
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
                $('#Timerdiv').hide();
                $('#Select_Action').prop('disabled', false);
            }
            
            if ($(this).val() == 'Sundown') {
                //alert('Sundown');
                // Request from server via socket.io
                socket.emit('request_sun_time', {'controller': 'sunset'});
                $('#Modificationsdiv').show();
                $('#Timerdiv').hide();
                $('#Select_Action').prop('disabled', false);
            }
            
            if ($(this).val() == 'Sunrise') {
                //alert('Sunrise');
                // Request from server via socket.io
                socket.emit('request_sun_time', {'controller': 'sunrise'});
                $('#Modificationsdiv').show();
                $('#Timerdiv').hide();
                $('#Select_Action').prop('disabled', false);
            }
            if ($(this).val() == 'Timer') {
                $('#Modificationsdiv').hide();
                $('#Timerdiv').show();
                $('#Select_Action').val('On');
                $('#Select_Action').prop('disabled', true);
                $('#Select_Weather_Good_Time').val(0);
                $('#Select_Weather_Bad_Time').val(0);
                $('#Select_Randomizer_Value').val(0);
                
            }
        });
        
        // When the user switches focus from the time input, make sure it was a correct value.
        $('#Time').focusout(function() {
            var correctTime = formatTime($(this).val());
            if (correctTime !== false) {
                $(this).val(correctTime);
                $(this).removeClass('bg-danger');
            } else {
                $('#Time').addClass('bg-danger');
            }
        });
        
        
    }
    
    $('#devicetoview').change(function() { 
            window.location.href = '/?deviceid='+$(this).val();
        });
});

function pause_schedules() {
   $.get('/pauseschedules',function (data) {
       return true;
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
                        debug:debugselector

                        }, function (data) {
         //alert(data);
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