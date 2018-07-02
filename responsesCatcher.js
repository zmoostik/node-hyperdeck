var ResponsesCatcher = function(cb) {
	this.queries = [];
	this.cb = cb;
};

ResponsesCatcher.prototype.debug = function() {
	var arr = [];
	for (var i = 0; i < this.queries.length; i ++) {
		var query = this.queries[i];
		arr[i] = query.response == undefined 
			? undefined 
			:(query.response.isSuccessful() ? true : false);
	}
	console.log(JSON.stringify(arr));
};

ResponsesCatcher.prototype.isFinished = function() {
	for (var i = 0; i < this.queries.length; i ++) {
		if (this.queries[i].response == undefined) return false;
	}
	return true;
};

ResponsesCatcher.prototype.isSuccessful = function() {
	for (var i = 0; i < this.queries.length; i ++) {
		var query = this.queries[i];
		if (query.response && !query.response.isSuccessful()) return false;
	}
	return true;
};

ResponsesCatcher.prototype.setResponse = function(query, response) {
	query.response = response;
	if (this.cb) this.cb(this, query.data, response);
};

ResponsesCatcher.prototype.catcher = function(data) {
	var self = this;
	var query = {
		"data": data,
		"response": undefined
	};
	this.queries.push(query);
	
	return function(response) {
		self.setResponse(query, response);
	}
};


module.exports = ResponsesCatcher;
