/* eslint-env node */
import Connection from "./connection.js";
import Service from "./service.js";
import Pixoo from "./devices/pixoo.js";
import fs from "fs";

const DEFAULTS = {
	connection: {
		deviceMAC: null,
		maxConnectAttempts: 3,
		connectionAttemptDelay: 500
	},
	pixoo: {
		brightness: 50
	},
	service: {
		hostname: "localhost",
		port: "8000",
		autoConnect: true
	}
};
const HELP_TEXT = `
node index.js <option>

OPTIONS
  -a	
  	Autodetect MAC address of device. Doesn't work on linux.
  
  -m <MAC>
	Set the MAC of the device manually.

  -c <PATH>
	Path to a JSON file with config settings.
`;

// This closure is needed since we do not run this file as module and
// therefore would have no async-await.
(async function () {

	// Let's asume we call index.js always over node
	const args = process.argv.slice(2);
	let settings, config;
	
	switch (args[0]) {
		case "-c":
			settings = JSON.parse(fs.readFileSync(args[1]));
			break;
		case "-a":
			// node-bluetooth-serial-port does not support listing paired devices
			// on linux – sais the documentation.
			if (process.platform === "linux") {
				console.log(HELP_TEXT);
				console.log("Can't auto-detect paired devices.");
				process.exit(1);
			}
			break;
		case "-m":
			settings = {connection: {deviceMAC: args[1]}};
			break;
		default:
			console.log(HELP_TEXT);
			process.exit(0);
	}

	config = Object.assign({}, DEFAULTS, settings);

	if (config.connection.deviceMAC === null) {
		// Attempt MAC auto detect
		const devices = await Connection.pairedDevices();
		for (let i = 0; i < devices.length; i++) {
			if (devices[i].name === "Pixoo") {
				config.connection.deviceMAC = devices[i].address.replace("-", ":");
				break;
			} 
		}
	}

	if (config.connection.deviceMAC === null) {
		console.log(HELP_TEXT);
		console.log("Can't find paired devices.");
		process.exit(1);
	}

	console.log("Found device:", config.connection.deviceMAC);
	
	// Let's disconnect properly when the app is done, shall we? Oh, there is some sh** going
	// on with windows (as usual) let's handle that first.
	if (process.platform === "win32") {
		let rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout
		});
		
		// If you can't make it fake it.
		rl.on("SIGINT", function () {
			process.emit("SIGINT");
		});
	}
	
	// There should be the MAC address by now and connect to the device if it
	// is paired.
	const connection = new Connection(config.connection);
	const device = new Pixoo(config.device);
	const service = new Service(config.service);

	// Let's disconnect properly from the device.
	process.on("SIGINT", (code) => {
		service.stop();
		connection.disconnect();
		process.exit();
	});

	// let's log a bit.
	connection.on("connecting", attempt => {
		console.log(`Connection attempt ${attempt+1}/${config.connection.maxConnectAttempts}`);
	});
	connection.on("received", buffer => {
		console.log("<=", buffer.toString("hex"));
		//console.log("<=", device._dissambleMessage(buffer.toString("hex")));
	});
	connection.on("sending", buffer => {
		console.log("=>", buffer.toString("hex"));
	});
	connection.on("connected", () => {
		console.log("Connected.");
	});
	connection.on("error", error => {
		console.log("Error:", error);
	});

	service.start(connection, device);
})();
