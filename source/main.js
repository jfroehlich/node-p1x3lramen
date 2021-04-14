import Connection from './connection.js';
import Pixoo from './devices/pixoo.js';

const settings = {
	connection: {
		maxConnectAttempts: 3,
		connectionAttemptDelay: 500
	},
	pixoo: {
		brightness: 50
	},
	service: {
		hostname: "localhost",
		port: "8000"
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

	// This is the proof of concept for now. It should have the
	// MAC address by now and connect to the device if it is paired.
	const connection = new Connection(settings.connection);
	const device = new Pixoo(settings.device);

	console.log('Connecting to Pixoo:', address);
	await connection.connect(address);
	
	console.log("Switching to green color...");
	const message = device.customColor("00ff00");
	for (const buffer of message) {
		console.log('Sending:', buffer);
		console.log('length:', await connection.write(buffer));
	}

	// Let's disconnect properly, shall we? Oh, there is some sh** going
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
		connection.disconnect();
		process.exit();
	});

})();
