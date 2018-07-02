var hyperdeck = require("./hyperdeck");

var client = new hyperdeck.Client('192.168.253.51');
client.connect();
client.on("asynchResponse", function(response) {
	response.debug();
});

client.on("disconnect", function() {
	console.log("disconnect");
});

client.on("connect", function() {
	client.notify("transport", true);
	client.play();
	client.diskList(function(response) { 
		console.log("Disk List:", response.isSuccessful() ? "Ok" : "Error");
	});
});


