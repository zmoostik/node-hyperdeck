var Response = function(code, text, params) {
	this.code = code;
	this.text = text;
	this.params = params;
};

Response.prototype.isAsynchronousCode = function(code) {
	return code >= 500 && code <= 599;
};

Response.prototype.isAsynchronous = function() {
	return this.isAsynchronousCode(this.code);
};

Response.prototype.isSuccessfulCode = function(code) {
	return code >= 200 && code <= 299;
};

Response.prototype.isSuccessful = function() {
	return this.isSuccessfulCode(this.code);
};

Response.prototype.getMessageCode = function(code) {
	var codeMessages = {
		100 : "syntax error",
		101 : "unsupported parameter",
		102 : "invalid value",
		103 : "unsupported",
		104 : "disk full",
		105 : "no disk",
		106 : "disk error",
		107 : "timeline empty",
		109 : "out of range",
		110 : "no input",
		111 : "remote control disabled",
		120 : "connection rejected",
		150 : "invalid state",
		200 : "Successful response codes (acknowledgement of a command)",
	};

	if (code >= 500 && code < 600)
		return  "Asynchronous response codes (Connection response)";

	if (code >= 201 && code < 300)
		return "Successful response codes (acknowledgement of a parameter)";

	if (code in codeMessages)
		return codeMessages[code];

	return false;
};

Response.prototype.getMessage = function() {
	return this.getMessageCode(this.code);
};

Response.prototype.debug = function() {
	console.log("{");
	console.log("\tcode: " + this.code);
	console.log("\ttext: " + JSON.stringify(this.text));
	console.log("\tparams: {");
	for (key in this.params) {
		console.log("\t\t" + key + ": " + JSON.stringify(this.params[key]));
	}
	console.log("\t}");
	console.log("\tmessage: " + this.getMessage());
	console.log("\tasynchronous: " + (this.isAsynchronous() ? "true" : "false"));
	console.log("}");
};

module.exports = Response;
