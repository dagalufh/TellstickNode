function check_updates() {
  $.ajax({
    url: '/updates-check',
    type: 'GET',
    success: function(data) {
      if (data.status) {
        $('#githubversion').html(data.version + ' - Pleade update your application.');
      } else {
        $('#githubversion').html(data.version + ' - No update needed.');
      }
    }
  })
}

function showfiles (backup) {
  var currentlyvisible = $('[name="' + backup + '"]').is(':visible');
  $(".files").hide();
  if (currentlyvisible === false) {
    $('[name="' + backup + '"]').parent().parent().parent().toggle();
  }
  $('[name="' + backup + '"]').removeAttr('checked');
}

function restore () {
    var folder = ''
    var files = $('input[type="checkbox"]:checked').map(function() {
        folder = this.name;
        return this.value;
    }).get(); 
    
    $.ajax({
    url: '/restore-backup',
    type: 'POST',
    data: {'folder':folder,'files':files},
    success: function(data) {
      if (data.status) {
        $('#respons-modal-body').html('Backup has been successfully restored. See log for more info.');
        $('#myModal').modal('show');
        //window.location.href = '/newschedule';
        $('#myModal').on('hidden.bs.modal',function (e) {
            window.location.href='/logs';
        });
      } else {
        $('#respons-modal-body').html('Error occured while restoring. See log for more info.');
        $('#myModal').modal('show');
        //window.location.href = '/newschedule';
        $('#myModal').on('hidden.bs.modal',function (e) {
            window.location.href='/logs';
        });
      }
    }
  })
    
    console.log(files);
}

$(function(ready){  
  $(".files").hide();
  $("#restorebackup").prop('disabled',true);
  
  $('input[type="checkbox"]').change(function() {  
    var checkinputs = []; // : checked?
    checkinputs = $('input[type="checkbox"]:checked').map(function() {
        return this.value;
    }).get();
    console.log(checkinputs.length);
    if (checkinputs.length > 0) {
      $("#restorebackup").prop('disabled',false);  
    } else {
      $("#restorebackup").prop('disabled',true);
    }
  })
})