function device() {
    this.id = '';
    this.name = '';
    this.type = '';
    this.lastcommand = '';
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
    this.duration = '';
    this.uniqueid = '';
    this.originaltime = '';
    this.stage = 0;
    this.enabled = 'true';
    this.lightpercentage = 100;
}

exports.device = device;
exports.schedule = schedule;