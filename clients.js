var Client = require('./client');
var ResponsesCatcher = require('./responsesCatcher');

var Clients = function() {
	this.clients = [];	
};

Clients.prototype.count = function() {
	return this.clients.length;
};

Clients.prototype.getClient = function(i) {
	return this.clients[i];
};

Clients.prototype.addClient = function(client) {
	this.clients.push(client);
};

Clients.prototype.add = function(host, port, info) {
	this.addClient(new Client(host, port, info));
};

Clients.prototype.connect = function(cb) {
	var self = this;
	var connected = 0;
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.connect();
		client.on("connect", function() {
			console.log("connected with", client.host);
			connected++;
			if (cb && connected == self.clients.length) cb.call(self);
		});
	}
};

Clients.prototype.debug = function() {
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.debug();
	}	
};

Clients.prototype.send = function(cmd, cb) {
	var responsesCatcher = new ResponsesCatcher(cb);
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.send(cmd, responsesCatcher.catcher(client));
	}	
};

Clients.prototype.on = function(eventName, cb) {
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.on(eventName, cb);
	}	
};

Clients.prototype.notifyAll = function(cb) {
	var responsesCatcher = new ResponsesCatcher(function(catcher) {
		if (catcher.isFinished())
			cb(true);
	});
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.notifyAll(responsesCatcher.catcher(client));
	}	
};

//Commands

Clients.prototype.recordName = function(name, cb) {
	var responsesCatcher = new ResponsesCatcher(cb);
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.recordName(name, responsesCatcher.catcher(client));
	}	
};

Clients.prototype.deviceInfo = function(cb) {
	var responsesCatcher = new ResponsesCatcher(cb);
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.deviceInfo(responsesCatcher.catcher(client));
	}	
};

Clients.prototype.transportInfo = function(cb) {
	var responsesCatcher = new ResponsesCatcher(cb);
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.transportInfo(responsesCatcher.catcher(client));
	}	
};

Clients.prototype.slotInfo = function(cb) {
	var responsesCatcher = new ResponsesCatcher(cb);
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.slotInfo(responsesCatcher.catcher(client));
	}	
};

Clients.prototype.configuration = function(cb) {
	var responsesCatcher = new ResponsesCatcher(cb);
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.configuration(responsesCatcher.catcher(client));
	}	
};

Clients.prototype.remote = function(cb) {
	var responsesCatcher = new ResponsesCatcher(cb);
	for (var i = 0; i < this.clients.length; i++) {
		var client = this.clients[i];
		client.remote(responsesCatcher.catcher(client));
	}	
};

Clients.prototype.diskList = Client.prototype.diskList;
Clients.prototype.ping = Client.prototype.ping;
Clients.prototype.previewEnable = Client.prototype.previewEnable;
Clients.prototype.record = Client.prototype.record;
Clients.prototype.play = Client.prototype.play;
Clients.prototype.stop = Client.prototype.stop;
Clients.prototype.notify = Client.prototype.notify;
Clients.prototype.goto = Client.prototype.goto;
Clients.prototype.gotoTimecode = Client.prototype.gotoTimecode;
Clients.prototype.gotoClip = Client.prototype.gotoClip;
Clients.prototype.uptime = Client.prototype.uptime;

module.exports = Clients;
