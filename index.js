const tuya = require('tuyapi');
const debug = require('debug')('homebridge-tuya');

module.exports = function(homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  homebridge.registerAccessory("homebridge-tuya-outlet", "TuyaOutlet", TuyaOutlet);
}

function TuyaOutlet(log, config) {
  this.log = log;
  this.name = config.name;
  if (config.ip != undefined) {
    this.tuya = new tuya({type: 'outlet', ip: config.ip, id: config.devId, key: config.localKey});
  }
  else {
    this.tuya = new tuya({type: 'outlet', id: config.devId, key: config.localKey});
    this.tuya.resolveIds();
  }

  this._service = new Service.Outlet(this.name);
  this._service.getCharacteristic(Characteristic.On).on('set', this._setOn.bind(this));
  this._service.getCharacteristic(Characteristic.On).on('get', this._get.bind(this));
}

TuyaOutlet.prototype._setOn = function(on, callback) {
  debug("Setting device to " + on);

  this.tuya.set({set: on}).then(() => {
    return callback(null, true);
  }).catch(error => {
    return callback(error, null);
  });
}

TuyaOutlet.prototype._get = function(callback) {
  debug("Getting device status...");
  this.tuya.get().then(status => {
    return callback(null, status);
  }).catch(error => {
    callback(error, null);
  });
}

TuyaOutlet.prototype.getServices = function() {
  return [this._service];
}

TuyaOutlet.prototype.identify = function (callback) {
  debug(this.config.name + " was identified.");
  callback();
};
