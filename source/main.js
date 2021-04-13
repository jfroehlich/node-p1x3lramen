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
}

const device = new Device(settings.device);
device.connect(address);
