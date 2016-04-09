function customlog_remove() {
	$('input[id^="customlog_item_"]:checked').each(function() {
		$(this).parent().parent().remove();
	});
}

function customlog_add() {
	if ($('#customlog_new').val().length > 0) {
		$('#customlog_table TR').last().before('<tr><td><span class="checkbox"><label><input type="checkbox" id="customlog_item_' + $('#customlog_table TR').length + '" value="' + $('#customlog_new').val() + '"> ' + $('#customlog_new').val() + '</label></span></td></tr>');
	}
}

function options_save() {
	var customlogs = [];
	$('input[id^="customlog_item_"]').each(function() {
		customlogs.push($(this).val());
	});

	$.post('/options', {
		city: $('#city').val(),
		port: $('#port').val(),
		doubletapcount: $('#doubletapcount').val(),
		doubletapseconds: $('#doubletapseconds').val(),
		weathercodes: $('#weathercodes').val(),
		autoremote_password: $('#autoremote_password').val(),
		autoremote_key: $('#autoremote_key').val(),
		autoremote_message: $('#autoremote_message').val(),
		appid: $('#appid').val(),
		autoremote_onlaunch: $("#autoremote_onlaunch").prop('checked'),
		autoremote_onchange: $("#autoremote_onchange").prop('checked'),
		customlogs: customlogs,
		theme: $('#Select_Theme').val()
	}, function() {
		modal_notification();
		$('#respons-modal-body').html('Options has been saved.');
		$('#myModal').modal('show');
	});
	return false;
}