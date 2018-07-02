var net = require('net');
var Parser = require('./parser');
var Response = require('./response');
var ResponsesCatcher = require('./responsesCatcher');

var Client = function(host, port, info) {
	this.host = host;
	this.port = port ? port : 9993;
	this.info = info;
	this.state = {
		"device": {},
		"transport": {},
		"slot": {},
		"configuration": {},
		"remote": {}
	};

	this.socket = new net.Socket();
	this.parser = new Parser();
	this.pending = [];
	this.init();
};

Client.prototype.connect = function(cb) {
	this.socket.connect(this.port, this.host);
};

Client.prototype.init = function() {
	var self = this;
	this.socket.on('data', function(data) {
		self.onData(data);
	});

	this.parser.onResponse = function(code, text, params) {
		self.onResponse(code, text, params);
		//this.debug();
	};
}

Client.prototype.notifyAll = function(cb) {
	var responsesCatcher = new ResponsesCatcher(function(catcher) {
		if (catcher.isFinished()) 
			cb(true);
	});
	
	this.transportInfo(responsesCatcher.catcher(this));
	this.slotInfo(responsesCatcher.catcher(this));
	this.configuration(responsesCatcher.catcher(this));
	this.remote(responsesCatcher.catcher(this));

	this.notify("transport", true, responsesCatcher.catcher(this));
	this.notify("slot", true, responsesCatcher.catcher(this));
	this.notify("configuration", true, responsesCatcher.catcher(this));
	this.notify("remote", true, responsesCatcher.catcher(this));
	this.notify("droped frame", true, responsesCatcher.catcher(this));
};

//commands
Client.prototype.deviceInfo = function(cb) {
	var self = this;
	this.send("device info", function(response) {
		this.state.device = response.params;
		if (cb) cb(response);
	});
};

Client.prototype.diskList = function(cb) {
	this.send("disk list", cb);
};

Client.prototype.ping = function(cb) {
	this.send("ping", cb);
};

Client.prototype.previewEnable = function(value, cb) {
	this.send("preview: enable: " + (value ? "true" : "false"), cb);
};

Client.prototype.record = function(cb) {
	this.send("record", cb);
};

Client.prototype.recordName = function(name, cb) {
	for (key in this.info) {
		name = name.replace("%" + key + "%", this.info[key]);
	}
	this.send("record: name: " + name, cb);
};

Client.prototype.play = function(cb) {
	this.send("play", cb);
};

Client.prototype.stop = function(cb) {
	this.send("stop", cb);
};

Client.prototype.notify = function(type, value, cb) {
	this.send("notify: " + type + ": " + (value ? "true" : "false"), cb);
};

Client.prototype.goto = function(type, value, cb) {
	this.send("goto: " + type + ": " + value, cb);
};

Client.prototype.gotoClip = function(clipId, cb) {
	this.goto("clip id", clipId, cb);
};

Client.prototype.gotoTimecode = function(timecode, cb) {
	this.goto("timecode", timecode, cb);
};

Client.prototype.uptime = function(cb) {
	this.send("uptime", cb);
};

Client.prototype.transportInfo = function(cb) {
	var self = this;
	this.send("transport info", function(response) {
		self.state.transport = response.params;
		if (cb) cb.call(self, response);
	});
};

Client.prototype.slotInfo = function(cb) {
	var self = this;
	this.send("slot info", function(response) {
		self.state.slot = response.params;
		if (cb) cb.call(self, response);
	});
};

Client.prototype.configuration = function(cb) {
	var self = this;
	this.send("configuration", function(response) {
		self.state.configuration = response.params;
		if (cb) cb.call(self, response);
	});
};

Client.prototype.remote = function(cb) {
	var self = this;
	this.send("remote", function(response) {
		self.state.remote = response.params;
		if (cb) cb.call(self, response);
	});
};

//----
Client.prototype.send = function(cmd, cb) {
	this.pending.push({
		"cmd": cmd,
		"cb": cb
	});
	//console.log(cmd);
	this.socket.write(cmd + "\n");
};

Client.prototype.on = function(eventName, cb) {
	var self = this;
	this.socket.on(eventName, function(data) {
		cb.call(self, data);
	});
}

Client.prototype.onAsynchResponse = function(response) {
	switch (response.text) {
		case "connection info":
			this.state.device = response.params;
			this.socket.emit("deviceInfo", this.state.device);
			break;
		case "transport info":
			for (key in response.params) {
				this.state.transport[key] = response.params[key];
			}
			this.socket.emit("transportInfo", this.state.transport);
			break;
		case "slot info":
			for (key in response.params) {
				this.state.slot[key] = response.params[key];
			}
			this.socket.emit("slotInfo", this.state.slot);
			break;
		case "configuration":
			for (key in response.params) {
				this.state.configuration[key] = response.params[key];
			}
			this.socket.emit("configuration", this.state.configuration);
			break;
		case "remote info":
			for (key in response.params) {
				this.state.remote[key] = response.params[key];
			}
			this.socket.emit("remote", this.state.remote);
			break;
	}
};

Client.prototype.onResponse = function(code, text, params) {
	var response = new Response(code, text, params);
			
	if (response.isAsynchronous()) {
		//console.log("Asynch response");
		//response.debug();
		this.onAsynchResponse(response);
		this.socket.emit("asynchResponse", response);
		return;
	}

	var cmd = this.pending.shift();
	if (cmd) {
		//console.log("Response for: “" + cmd.cmd + "”");
		//response.debug();
		if (cmd.cb != null) cmd.cb.call(this, response);
		return;
	}
}

Client.prototype.onData = function(data) {
	//console.log("nouvelle data: [" + JSON.stringify(data.toString()) + "]");
	this.parser.read(data);
};

Client.prototype.debug = function() {
	console.log("=== CLIENT ===");
	console.log("host:", this.host);
	console.log("port:", this.port);
	console.log("[info]");
	for (key in this.info) {
		console.log(key + ":", this.info[key]);
	}
	console.log("[state]");
	for (key in this.state) {
		console.log(key + ":", this.state[key]);
	}
};

module.exports = Client;

