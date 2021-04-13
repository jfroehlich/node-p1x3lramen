import { TinyColor } from '@ctrl/tinycolor';

const DEFAULTS = {
	brightness: 50
};


export default class Pixoo {
	constructor(settings) {
		this.config = Object.assign({}, settings, DEFAULTS);
	}

	customColor(color) {
		const message = [
			"4501",									// Prefix for light
			this._colorHex(color),					// Color
			this._percentHex(this._brightness),		// Brightness from 0-100
			this._intHex(0),						// lightning type (?)
			this._boolHex(true),					// power (?)
			"000000"								// Suffix
		].join('');

		return this._binaryBuffer(this._compileMessage(message));
	}

	// --- Internal methods ---

	_intLittleHex(value) {
		if (value > 65535 || value < 0) {
			throw new TypeError('intLittleHex only supports value between 0 and 65535');
		}
		var byte1 = (value & 0xFF).toString(16).padStart(2, "0");
		var byte2 = ((value >> 8) & 0xFF).toString(16).padStart(2, "0");
		return "" + byte1 + byte2;
	}

	_boolHex(bool) {
		return bool ? "01" : "00";
	}

	_colorHex(color) {
		return new TinyColor(color).toHex();
	}

	_percentHex(percent) {
		if (percent > 100) {
			percent = 100;
		}
		else if (percent < 0) {
			percent = 0;
		}
		return this._intHex(Math.trunc(percent));
	}

	_unHex(str) {
		let result = '';
		if (str.length % 2 !== 0) {
			throw new Error('The string length is not a multiple of 2');
		}
		for (let i = 0, l = str.length; i < l; i += 2) {
			var toHex = parseInt(str.substr(i, 2), 16);
			if (isNaN(toHex)) {
				throw new Error('str contains non hex character');
			}
			result += String.fromCharCode(toHex);
		}
		return result;
	}

	_compileMessage(payload) {
		let lengthHS = this._intLittleHex((payload.length + 4) / 2);
		
		let msg = '' + lengthHS + payload;
		let sum = 0;
		for (var i = 0, l = msg.length; i < l; i+= 2) {
			sum += parseInt(msg.substr(i, 2), 16);
		}
		let crc = sum % 65536;
		let crcHS = this._intLittleHex(crc); 

		return [
			'01',
			lengthHS,
			payload,
			crcHS,
			'02'
		].join('');
	}

	_binaryBuffer(message) {
		let bufferArray = [];
		message.match(/.{1,1332}/g).forEach(part => {
			bufferArray.push(Buffer.from(this._unHex(part), 'binary'));
		});
		return bufferArray;
	}
}
