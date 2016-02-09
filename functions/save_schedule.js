function post(req, res) {
	var variables = require('../templates/variables');
	var sharedfunctions = require(variables.rootdir + 'functions/sharedfunctions');
	var devicefunctions = require(variables.rootdir + 'functions/device');
	var classes = require(variables.rootdir + 'templates/classes');
	req.body.originaltime = req.body.time;
	req.body.stage = 0;

	var newschedule = new classes.schedule();

	for (var key in req.body) {
		newschedule[key] = req.body[key];
	}
	
	variables.schedulesbyday.forEach(function(day) {
    for (var i = 0; i < day.length; i++) {
        if (newschedule.uniqueid == day[i].uniqueid) {
          //sharedfunctions.logToFile('Schedule,' + devicecontrol.getdeviceproperty(day[i].deviceid,'name') + ',' + day[i].uniqueid + ',REMOVED,Schedule was removed. Info that was removed: ' + JSON.stringify(day[i]), 'Device-' + day[i].deviceid);
          day.splice(i, 1);
          i = 0;
        }
      
    }

  });
	
	variables.devices.forEach(function(device) {
		if (device.id == newschedule.deviceid) {
			device.schedule.forEach(function(schedule) {

				if (schedule.uniqueid == newschedule.uniqueid) {
					for (var key in newschedule) {
						schedule[key] = newschedule[key];
					}
				}
			});
		}
	});
	
	newschedule.dayofweek.forEach(function(day) {

		newschedule.criterias.forEach(function(criteria) {
			var tempday = new classes.day();
			tempday.criteriaid = criteria.criteriaid;
			tempday.uniqueid = newschedule.uniqueid;
			tempday.time = criteria.time;
			tempday.deviceid = newschedule.deviceid;
			variables.schedulesbyday[day].push(tempday);
		})
	})
	
	
	variables.savetofile = true;
	sharedfunctions.logToFile('Schedule,' + devicefunctions.getdeviceproperty(newschedule.deviceid, 'name') + ',' + newschedule.uniqueid + ',Saved,Watcher was saved with this settings: ' + JSON.stringify(newschedule), 'Device-' + newschedule.deviceid);
	res.send('Schedule has been saved.');
}

exports.post = post;