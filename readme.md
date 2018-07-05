Hyperdeck npm package
-------
This is a Node.js client librairy that implements Blackmagic Hyperdeck's protocol

#Simple usage:

```javascript
var hyperdeck = require("hyperdeck");

var client = new hyperdeck.Client('192.168.253.51');
client.connect();

client.on("disconnect", function() {
	console.log("disconnect");
});

client.on("connect", function() {
	client.play();
	client.diskList(function(response) { 
		console.log("Disk List:", response.isSuccessful() ? "Ok" : "Error");
	});
});
```
