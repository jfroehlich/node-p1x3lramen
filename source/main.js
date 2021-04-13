import Device from './device.js';

const settings = {
	device: {
		maxConnectAttempts: 3,
		connectionAttemptDelay: 500
	},
	service: {
		hostname: "localhost",
		port: "8000"
	}
};

(async function () {
	
	let address = process.argv.lenght === 3 ? process.argv[2] : null;

	if (address === null && process.platform === 'linux') {
		console.log("node index.js <DEVICEMAC>")
		console.log("Can't list paired devices.");
		return;
	}

	if (address === null) {
		// Attempt MAC auto detect
		const devices = await Device.pairedDevices();
		for (let i = 0; i < devices.length; i++) {
			if (devices[i].name === 'Pixoo') {
				address = devices[i].address.replace('-', ':');
				break;
			} 
		}
	}

	console.log('Using Pixoo:', address);
	const device = new Device(settings.device);
	device.connect(address);

	if (process.platform === "win32") {
		let rl = require("readline").createInterface({
			input: process.stdin,
			output: process.stdout
		});
		
		rl.on("SIGINT", function () {
			process.emit("SIGINT");
		});
	}

	process.on('SIGINT', (code) => {
		device.disconnect();
		process.exit();
	});

})();
