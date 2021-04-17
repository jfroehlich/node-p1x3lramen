import { TinyColor } from '@ctrl/tinycolor';

const DEFAULTS = {
	brightness: 50,
	color: 'ffffff',
	lightningMode: 0, // 0 = Custom, 1 = love, 2 = plants, 3 = no mosquito, 4 = sleep
	clockMode: 0,
	showTime: true,
	showWeather: true,
	showTemperature: true,
	showCalendar: true
};

/**
 *
 */
export default class Pixoo {
	constructor(settings) {
		this.config = Object.assign({}, settings, DEFAULTS);
	}

	// --- Base Commands ---
	
	brightness(level) {
		level = level > 100 ? 100 : level;
		level = level < 0 ? 0 : level;
		this.config.brightness = level;

		const message = [
			"74",										// Prefix for light
			this._percentHex(this.config.brightness)	// Brightness from 0-100
			//this._intHex(this.config.lightningMode)		// lightning type
		].join('');
		return this._binaryBuffer(this._compileMessage(message));
	}

	datetime(date) {
		const message = [
			"18",										// Prefix for light
			this._intHex(Number(date.getFullYear().toString().padStart(4, "0").slice(2))),
			this._intHex(Number(date.getFullYear().toString().padStart(4, "0").slice(0, 2))),
			this._intHex(date.getMonth() + 1),
			this._intHex(date.getDate()),
			this._intHex(date.getHours()),
			this._intHex(date.getMinutes()),
			this._intHex(date.getSeconds()),
			"00"
		].join('');
		return this._binaryBuffer(this._compileMessage(message));
	}

	// --- Clock Mode ---
	
	clock(mode, showTime, showWeather, showTemperature, showCalendar, color) {
		this.config.clockMode = mode || this.config.clockMode;
		this.config.showTime = showTime || this.config.showTime;;
		this.config.showWeather = showWeather || this.config.showWeather;
		this.config.showTemperature = showTemperature || this.config.showTemperature;
		this.config.showCalendar = showCalendar || this.config.showCalendar;
		this.config.color = color || this.config.color;

		const message = [
			"450001",									// Command Prefix
			this._intHex(this.config.clockMode),
			this._boolHex(this.config.showTime),
			this._boolHex(this.config.showWeather),
			this._boolHex(this.config.showTemperature),
			this._boolHex(this.config.showCalendar),
			this._colorHex(this.config.color)
		].join('');
		return this._binaryBuffer(this._compileMessage(message));
	}

	// --- Lighting Mode --

	customColor(color) {
		this.config.color = color;
		this.config.lightningMode = 0; // Custom color mode

		const message = [
			"4501",										// Prefix for light
			this._colorHex(this.config.color),			// Color
			this._percentHex(this.config.brightness),	// Brightness from 0-100
			this._intHex(this.config.lightningMode),	// lightning type
			this._boolHex(true),						// power
			"000000"									// Suffix
		].join('');
		return this._binaryBuffer(this._compileMessage(message));
	}

	fancyLightning(mode) {
		this.config.lightningMode = mode;

		const message = [
			"4501",										// Prefix for light
			this._colorHex(this.config.color),			// Color
			this._percentHex(this.config.brightness),	// Brightness from 0-100
			this._intHex(this.config.lightningMode),	// lightning type
			this._boolHex(true),						// power
			"000000"									// Suffix
		].join('');
		return this._binaryBuffer(this._compileMessage(message));
	}

	powerScreen(status) {
		if (typeof status !== 'boolean') {
			throw new Error('The status needs to be a boolean value.');
		}

		const message = [
			"4501",										// Prefix for light
			this._colorHex(this.config.color),			// Color
			this._percentHex(this.config.brightness),	// Brightness from 0-100
			this._intHex(this.config.lightningMode),	// lightning mode
			this._boolHex(status),						// power
			"000000"									// Suffix
		].join('');
		return this._binaryBuffer(this._compileMessage(message));
	}

	// --- Internal methods ---

	_intHex(int) {
		if (int > 255 || int < 0) {
			throw new Error('numberHex works only with number between 0 and 255');
		}
		return Math.round(int).toString(16).padStart(2, "0");
	}

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
