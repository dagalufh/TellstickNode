function moveup () {
    $('#availabledevices option:selected').remove().appendTo('#includeddevices');
}

function movedown () {
    $('#includeddevices option:selected').remove().appendTo('#availabledevices');
}

function newdevicegroup(deviceid) {
    var devicearray = []
    var error = false;
    
    $('#includeddevices option').each(function(thing) {
        devicearray.push($(this).val());
    });
    
    if (devicearray.length == 0) {
        $('#includeddevices').addClass('bg-danger');
        error = true;
    } else {
        $('#includeddevices').removeClass('bg-danger');
    }
    
    if ($('#devicegroupname').val().length == 0) {
        $('#devicegroupname').addClass('bg-danger');
        error = true;   
    } else {
        $('#devicegroupname').removeClass('bg-danger');
    }
    
    if (error) {
        return false;
    }
    
    if (typeof(deviceid) == 'undefined') {
        $.post('/new_devicegroup',{
            devices:devicearray,
            name:$('#devicegroupname').val()
            }, function (data) {
                    $('#respons-modal-body').html(data.message);
                    $('#myModal').modal('show');
                    $('#myModal').on('hidden.bs.modal',function (e) {
                        if (data.code == 'ok') {
                            window.location.href='/new_devicegroup';
                        }
                    });
            }); 
    } else {
        $.post('/new_devicegroup',{
            deviceid:deviceid,
            devices:devicearray,
            name:$('#devicegroupname').val()
            }, function (data) {
                    $('#respons-modal-body').html(data.message);
                    $('#myModal').modal('show');
                    $('#myModal').on('hidden.bs.modal',function (e) {
                        if (data.code == 'ok') {
                            window.location.href='/view_devicegroups';
                        }
                    });
            }); 
    }
}

function removedevicegroup (deviceid) {
    $.ajax({
        url: '/remove_devicegroup',
        data: {'id':deviceid},
        success: function (data) {
            if (data) {
                window.location.href=window.location.href;
            }},
        error: function (data) {alert('Error occured when removing devicegroup with id: ' + deviceid);}
    }); 
}

function showdevicegroup(deviceid) {
    $('#respons-modal-body').html('Fetching devicegroup data.');
    $('#myModal').modal('show');
    $.ajax({
        url: '/showdevicegroup',
        data: {'id':deviceid},
        success: function (data) {
            $('#respons-modal-body').html(data);
            $('#myModal').modal('show');
        },
        error: function (data) {
            //$('#respons-modal-body').html('Error occured: ' + data.statusText);
            //$('#myModal').modal('show');
            console.log('Error when showing devicegroup info: ' + data.statusText);
        }
    }); 
}