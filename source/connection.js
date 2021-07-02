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
			this.emit('received', buffer);
		});
	}

	/**
	 * Test if the device is connected.
	 *
	 * @returns {boolean} The connection status.
	 */
	isConnected() {
		return this._port.isOpen();
	}

	/**
	 * Connect to the device.
	 *
	 * If the address param is not given, the method will use the address from
	 * the config.
	 *
	 * @param {string} [address] - The MAC adress for the the paired device which should be connected.
	 * @returns {Promise} - Resolving to a response from the connection.
	 */
	async connect(address) {
		if (this.isConnected()) {
			return;
		}
		
		this.config.deviceMAC = address || this.config.deviceMAC;
		if (!!this.config.deviceMAC === false) {
			throw new Error("No device MAC adress to connect to.");
		}

		let attempts = 0;
		
		// Log a connection attempt
		const log = msg => console.log(`[LOCAL]: Connection ${attempts+1}/${this.config.maxConnectAttempts}: ${msg}`);

		// Let's try connecting
		while (attempts < this.config.maxConnectAttempts) {
			this.emit('connecting', attempts, this._connection);
			try {
				const res = await this._attempt();
				this._connection = res;
				this.emit('connected', this._connection);
				return res
			} catch (error) {
				this.emit("error", error);
				attempts++;
				await this._sleep(this.config.connectionAttemptDelay);
			}
		}
		throw new Error("Failed to connect.");
	}

	async disconnect() {
		console.log("Disconnecting…");
		// FIXME Wrong? Needs to wait for an event before returning?
		this._port.close();
	}

	/**
	 * Write a buffer to the device
	 */
	async write(buffer) {
		this.emit('sending', buffer);
		return new Promise((resolve, reject) => {
			this._port.write(buffer, (error, bytes) => {
				return !!error ? reject(error) : resolve(bytes);
			})
		});
	}

	async writeImage(result){
		result.forEach(elt => {
			this._port.write(elt,
				function(err, bytesWritten) {
					if (err) console.log(err);
				}
			);
		})
	}

	/**
	 *	Write all buffers in a list to the device.
	 *
	 */
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
					resolve("Connected");
				}, () => reject("Cannot connect"));
			}, () => reject("Not found"));
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
