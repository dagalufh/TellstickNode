$(function(ready){  
    $('#logtoview').change(function() {  
               window.location.href='logs?logfile=' + $(this).val();    
    });
})