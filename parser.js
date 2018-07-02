var Parser = function() {
	this.buffer = "";
	this.reset();
}

Parser.prototype.setState = function(state) {
	this.state = state ? state : "Head";
};

Parser.prototype.reset = function() {
	this.code = null;
	this.text = null;
	this.params = {};
	this.setState(null);
};

Parser.prototype.readLineHead = function(line) {
	if (line.length < 5)
		return false;
	
	var code = line.substr(0, 3);
	if (line.substr(3, 1) != " ")
		return false;
		
	this.code = parseInt(code);
	if (isNaN(this.code) || this.code.toString() != code)
		return false;	

	var text = line.substr(4);	
	if (text.substr(text.length - 1, 1) == ":") {
		this.setState("KV");
		this.text = text.substr(0, text.length - 1);
		return undefined;
	}

	this.text = text;
	return true;
};

Parser.prototype.readLineKV = function(line) {
	if (line == "") {
		return true;
	}

	var cols = line.split(": ");
	if (cols.length != 2)
		return false;
	
	this.params[cols[0]] = cols[1];
	return undefined;
};

Parser.prototype.readLine = function(line) {
	//console.log("[" + this.state + "] " + JSON.stringify(line));
	var fct = "readLine" + this.state;
	return this[fct](line);
};

Parser.prototype.read = function(data) {
	var crlf = "\r\n";
	this.buffer += data;
	var pos = -1;
	while ((pos = this.buffer.indexOf(crlf)) != -1) {
		//console.log(JSON.stringify(this.buffer));
		
		var line = this.buffer.substr(0, pos);
		this.buffer = this.buffer.substr(pos + crlf.length);
		
		var result = this.readLine(line);
		
		if (result === true) {
			if ("onResponse" in this) this.onResponse.call(this, this.code, this.text, this.params);
			this.reset();
		}
		if (result === false) {
			if (this.onerror) this.onerror.call(this, "Parse error", line);
			this.reset();
		}
	}
}

Parser.prototype.debug = function() {
	console.log("{");
	console.log("\tcode: " + this.code);
	console.log("\ttext: " + JSON.stringify(this.text));
	console.log("\tparams: {");
	for (key in this.params) {
		console.log("\t\t" + key + ": " + JSON.stringify(this.params[key]));
	}
	console.log("\t}");
	console.log("}");
}

module.exports = Parser;
