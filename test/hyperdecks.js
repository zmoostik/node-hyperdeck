var Recorder = require("./recorder");

var recorder = new Recorder();
recorder.add("192.168.9.24", 9993, "Hyperdeck Mini 1", "cam1");
recorder.add("192.168.9.32", 9993, "Hyperdeck Mini 2", "cam2");
recorder.init(function() {
	recorder.start();
	setTimeout(function() {
		recorder.stop();
	}, 3000);
});

recorder.onChangeStatus = function(arr) {
	console.log(JSON.stringify(arr));
};

recorder.onChangeState = function(state) {
	console.log("state:", state);
};
