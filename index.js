const tuya = require('tuyapi');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-tuya-outlet", "TuyaOutlet", TuyaOutlet);
}

function TuyaOutlet(log, config) {
  this.log = log;
  this.name = config.name;
  this.tuya = new tuya({type: 'outlet', ip: config.ip, id: config.devId, uid: config.uid, key: config.localKey});

  this._service = new Service.Outlet(this.name);
  this._service.getCharacteristic(Characteristic.On).on('set', this._setOn.bind(this));
  this._service.getCharacteristic(Characteristic.On).on('get', this._get.bind(this));
}

TuyaOutlet.prototype._setOn = function(on, callback) {
  this.log("Setting device to " + on);
  this.tuya.setStatus(on, (error, result) => {
    if (error) { return callback(error, null); }
    return callback(null, true);
  });
}

TuyaOutlet.prototype._get = function(callback) {
  this.log("Getting device status...");
  this.tuya.getStatus((error, result) => {
    if (error) { return callback(error, null); }
    return callback(null, result);
  });
}

TuyaOutlet.prototype.getServices = function() {
  return [this._service];
}
