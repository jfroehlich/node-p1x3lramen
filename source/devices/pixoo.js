import { TinyColor } from '@ctrl/tinycolor';

const DEFAULTS = {
	brightness: 50,				// integer values from 0-100
	color: 'ffffff',			// currently only hex colors
	weather: 0,					// weather modes: 1 clear, 3 cloudy sky, 5 thunderstorm, 6 rain, 8 snow, 9 fog
	temperature: 0,				// temperature from -127 to 128
	lightingMode: 0,			// Lighting modes: 0 = Custom, 1 = love, 2 = plants, 3 = no mosquito, 4 = sleep
	clockMode: 0,				// Clock modes: 0 fullscreen, 1 rainbow, 2 boxed, 3 analog square, 4 fullscreen negative, 5 analog round, 6 widescreen 
	powerScreen: true,			// switch screen on/off
	showTime: true,				// show the time in clock channel 
	showWeather: true,			// show weather in clock channel 
	showTemperature: true,		// show temperature in clock channel 
	showCalendar: true			// show calendar in clock channel 
};

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

	weathertemp(weather, temperature) {
		this.config.weather = weather;
		this.config.temperature = temperature;
		
		const message = [
			"5F",										// prefix 
			(this.config.temperature >= 0) ? this._intHex(this.config.temperature) : this._intHex(256 + this.config.temperature),
			this._intHex(this.config.weather)
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
	
	lighting(mode, color, brightness, powerScreen) {
		this.config.mode = mode || this.config.mode;
		this.config.color = color || this.config.color;
		this.config.brightness = brightness || this.config.brightness;
		this.config.powerScreen = powerScreen || this.config.powerScreen;

		const message = [
			"4501",										// Prefix for light
			this._colorHex(this.config.color),			// Color
			this._percentHex(this.config.brightness),	// Brightness from 0-100
			this._intHex(this.config.lightingMode),		// lighting type
			this._boolHex(this.config.powerScreen),		// power
			"000000"									// suffix or functions?
		].join('');
		return this._binaryBuffer(this._compileMessage(message));
	}

	customColor(color) {
		this.config.color = color;
		this.config.lightingMode = 0;	// custom color mode
		this.config.powerScreen = true;	// switch screen on
		return this.lighting();
	}

	fancyLightning(mode) {
		this.config.lightingMode = mode;
		return this.lighting();
	}

	powerScreen(status) {
		this.config.powerScreen = status;
		return this.lighting();
	}

	// --- Visualization channel ---
	
	// --- Cloud channel ---
	
	// --- Custom channel ---

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
