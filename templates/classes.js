function device() {
  this.id = -1;
  this.name = '';
  this.type = '';
  this.lastcommand = '';
  this.watchers = [];
  this.schedule = [];
  this.activescheduleid = '';
  this.currentstatus = '';
  this.activeday = '';
  this.nextscheduleid = '';
  this.nextcriteriaid = '';
}

function schedule() {
  this.deviceid = '';
  this.dayofweek = '';
  this.action = '';
  this.runonce = 'false';
  this.duration = 0;
  this.uniqueid = '';
  this.stage = 0;
  this.enabled = 'true';
  this.lightpercentage = 100;
  this.sendautoremote = 'false';
  this.criterias = [];
  this.randomizerfunction = '+';
  this.randomiser = 0;
  this.weathergoodfunction = '+';
  this.weathergoodtime = 0;
  this.weatherbadfunction = '+';
  this.weatherbadtime = 0;
  this.earliest = '23:59'; // Defined the last minute of the day, making it easy to find a criteria earlier
}

function schedule_criteria() {
  this.criteriaid = -1;
  this.time = '';
  this.controller = '';
  this.originaltime = '';
  this.intervalnotbeforecontroller = 'None';
  this.intervalnotaftercontroller = 'None';  
  this.intervalnotbefore = '';
  this.intervalnotafter = '';
  this.disablemodifiers = 'false';
}

function devicegroup() {
  this.deviceids = [];
  this.name = '';
  this.schedule = [];
  this.activescheduleid = '';
  this.currentstatus = '';
  this.delaybetweendevices = 0;
}

function watcher() {
  this.deviceid = '';
  this.triggerstatus = '';
  this.enabled = 'true';
  this.autoremoteonschedule = 'false';
  this.actions = [];
  this.uniqueid = 0;
  this.onstatechanged = 'true'; // This represent the old way for watchers, when the device goes from on to off or reversed.
  this.oncommandsent = 'false'; // This will cause the watcher to be checked and triggered on device.send function
}

function day() {
  this.criteriaid = -1;
  this.uniqueid = 0;
  this.deviceid = -1;
  this.time = '';
}

exports.day = day;
exports.device = device;
exports.schedule = schedule;
exports.devicegroup = devicegroup;
exports.watcher = watcher;
exports.schedule_criteria = schedule_criteria;