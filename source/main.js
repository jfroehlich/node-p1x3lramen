import Connection from './connection.js';
import Service from './service.js';
import Pixoo from './devices/pixoo.js';

import {
	testClockIntegration,
	testLigtingIntegration,
	testDateTimeIntegration,
	testClimateIntegration,
	testBrightnessIntegration
} from './integration.js';

const settings = {
	connection: {
		deviceMAC: '',
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

// This closure is needed since we do not run this file as module and
// therefore would have no async-await.
(async function () {
	
	// Let's asume we call index.js always over node
	let address = process.argv.lenght === 3 ? process.argv[2] : null;

	// node-bluetooth-serial-port does not support listing paired devices
	// on linux – sais the documentation.
	if (address === null && process.platform === 'linux') {
		console.log("node index.js <DEVICEMAC>")
		console.log("Can't list paired devices.");
		return;
	}

	if (address === null) {
		// Attempt MAC auto detect
		const devices = await Connection.pairedDevices();
		for (let i = 0; i < devices.length; i++) {
			if (devices[i].name === 'Pixoo') {
				address = devices[i].address.replace('-', ':');
				break;
			} 
		}
	}

	if (address === null) {
		console.log("node index.js <DEVICEMAC>")
		console.log("Can't list paired devices.");
		return;
	}
	settings.connection.deviceMAC = address;
	
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

	// Let's disconnect properly from the device.
	process.on('SIGINT', (code) => {
		service.stop();
		connection.disconnect();
		process.exit();
	});

	// -- testing things --

	// This is the proof of concept for now. It should have the
	// MAC address by now and connect to the device if it is paired.
	const connection = new Connection(settings.connection);
	const device = new Pixoo(settings.device);
	const service = new Service(settings.service);

	//console.log('Connecting to Pixoo:', address);
	//await connection.connect(address);
	service.start(connection, device);
})();
