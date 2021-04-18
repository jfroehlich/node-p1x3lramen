import {EventEmitter} from 'events';
import BluetoothSerialPort from 'node-bluetooth-serial-port';

const DEFAULTS = {
	deviceMAC: '',
	maxConnectAttempts: 3,
	connectionAttemptDelay: 500
};

export default class Connection extends EventEmitter {
	constructor(settings) {
		super();

		this.config = Object.assign({}, DEFAULTS, settings);
		this._connection = null;
		this._port = Connection.port;
		this._port.on('data', buffer => {
			console.log('<=', buffer.toString('hex'));
		});
	}

	isConnected() {
		return this._port.isOpen();
	}

	async connect(address) {
		if (this.isConnected()) {
			console.log("The connection is already established.", this.config.deviceMAC);
			return;
		}
		
		this.config.deviceMAC = address || this.config.deviceMAC;
		if (!!this.config.deviceMAC === false) {
			throw new Error("No device MAC adress to connect to.");
		}

		let attempts = 0;
		console.log("connecting to", this.config.deviceMAC);
		
		// Log a connection attempt
		const log = msg => console.log(`[LOCAL]: Connection ${attempts+1}/${this.config.maxConnectAttempts}: ${msg}`);

		// Let's try connecting
		while (attempts < this.config.maxConnectAttempts) {
			try {
				const res = await this._attempt();
				log(res);
				this._connection = res;
				return res
			} catch (err) {
				log(err);
				attempts++;
				await this._sleep(this.config.connectionAttemptDelay);
			}
		}
		console.log("Can't connect. Giving up :(");
	}

	async disconnect() {
		console.log("Disconnecting…");
		// FIXME Wrong? Needs to wait for an event before returning?
		this._port.close();
	}

	async write(buffer) {
		return new Promise((resolve, reject) => {
			this._port.write(buffer, (error, bytes) => {
				return !!error ? reject(error) : resolve(bytes);
			})
		});
	}

	async writeAll(buffers) {
		// TODO Add an optional delay after each push
		const status = [];
		for (let buffer of buffers) {
			status.push(await this.write(buffer));
		}
		return status;
	}

	async _attempt() {
		const self = this;

		return new Promise((resolve, reject) => {
			// Find the device
			self._port.findSerialPortChannel(this.config.deviceMAC, channel => {
				// Connect to the device
				self._port.connect(this.config.deviceMAC, channel, function() {
					// We connected, resolve
					resolve('Connected');
				}, () => reject('Cannot connect'));
			}, () => reject('Not found'));
		});	
	}

	async _sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}

Connection.port = new BluetoothSerialPort.BluetoothSerialPort();

Connection.pairedDevices = function () {
	return new Promise((resolve, reject) => {
		Connection.port.listPairedDevices(data => {
			resolve(data);
		});
	});
};
