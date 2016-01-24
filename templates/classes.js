function device() {
  this.id = '';
  this.name = '';
  this.type = '';
  this.lastcommand = '';
  this.watchers = [];
  this.schedule = [];
  this.activescheduleid = '';
  this.currentstatus = '';
  this.activeday = '';
  this.nextschedule = '';
}

function schedule() {
  this.deviceid = '';
  this.dayofweek = '';
  this.controller = '';
  this.action = '';
  this.time = '';
  this.randomizerfunction = '+';
  this.randomiser = 0;
  this.weathergoodfunction = '+';
  this.weathergoodtime = 0;
  this.weatherbadfunction = '+';
  this.weatherbadtime = 0;
  this.runonce = 'false';
  this.duration = 0;
  this.uniqueid = '';
  this.originaltime = '';
  this.stage = 0;
  this.enabled = 'true';
  this.lightpercentage = 100;
  this.intervalnotbefore = '';
  this.intervalnotafter = '';
  this.sendautoremote = 'false';
  this.intervalnotbeforecontroller = 'None';
  this.intervalnotaftercontroller = 'None';
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
}

exports.device = device;
exports.schedule = schedule;
exports.devicegroup = devicegroup;
exports.watcher = watcher;