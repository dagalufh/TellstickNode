$(function(ready) {
  $('#logtoview').change(function() {
    $('#logtable').html('<tr><td>Loading Logfile</td></tr>');
    window.location.href = 'logs?logfile=' + $(this).val();
  });
});