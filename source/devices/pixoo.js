/* eslint-env node */
import { TinyColor } from "@ctrl/tinycolor";
import { Buffer } from "buffer";

const DEFAULTS = {
	brightness: 50,				// integer values from 0-100
	color: "ffffff",			// currently only hex colors
	weather: 0,					// weather modes: 1 clear, 3 cloudy sky, 5 thunderstorm, 6 rain, 8 snow, 9 fog
	temperature: 0,				// temperature from -127 to 128
	lightingMode: 0,			// Lighting modes: 0 = Custom, 1 = love, 2 = plants, 3 = no mosquito, 4 = sleep
	clockMode: 0,				// Clock modes: 0 fullscreen, 1 rainbow, 2 boxed, 3 analog square, 4 fullscreen negative, 5 analog round, 6 widescreen 
	powerScreen: true,			// switch screen on/off
	showTime: true,				// show the time in clock channel 
	showWeather: false,			// show weather in clock channel 
	showTemperature: false,		// show temperature in clock channel 
	showCalendar: false,		// show calendar in clock channel 
	redScore: 0,				// the red score 0-999
	blueScore: 0,				// the blue score 0-999
	visualizationMode: 0,		// 
	fulldayMode: true			// switches between 12h and 24h mode
};

export default class Pixoo {
	constructor(settings) {
		this.config = Object.assign({}, DEFAULTS, settings);
	}

	// --- Base Commands ---
	
	fullday(settings) {
		settings = settings || {};
		if (typeof settings.enable === "boolean") {
			this.config.fulldayMode = settings.enable;
		}
		
		// thanks julijane
		const message = [
			"2d",										// Prefix for light
			this._boolHex(this.config.fulldayMode)
		].join("");
		return this._compile(this._assembleMessage(message));
	}
	
	brightness(settings) {
		settings = settings || {};
		let level = settings.level || this.config.brightness;
		level = level > 100 ? 100 : level;
		level = level < 0 ? 0 : level;
		this.config.brightness = level;

		const message = [
			"74",										// Prefix 
			this._percentHex(this.config.brightness)	// Brightness from 0-100
		].join("");
		return this._compile(this._assembleMessage(message));
	}

	datetime(settings) {
		settings = settings || {};
		let date = settings.date || new Date();

		const message = [
			"18",										// Prefix 
			this._intHex(Number(date.getFullYear().toString().padStart(4, "0").slice(2))),
			this._intHex(Number(date.getFullYear().toString().padStart(4, "0").slice(0, 2))),
			this._intHex(date.getMonth() + 1),
			this._intHex(date.getDate()),
			this._intHex(date.getHours()),
			this._intHex(date.getMinutes()),
			this._intHex(date.getSeconds()),
			"00"
		].join("");
		return this._compile(this._assembleMessage(message));
	}

	climate(settings) {
		settings = settings || {};
		this.config.weather = settings.weather || this.config.weather;
		this.config.temperature = settings.temperature || this.config.temperature;
		
		const message = [
			"5F",										// prefix 
			(this.config.temperature >= 0) ? this._intHex(this.config.temperature) : this._intHex(256 + this.config.temperature),
			this._intHex(this.config.weather)
		].join("");
		return this._compile(this._assembleMessage(message));
	}

	// --- Clock Mode ---
	
	/**
	 * Switches to clock mode and sets clock mode options.
	 *
	 * @param {object} [settings] - The settings for the clock mode
	 * @param {object} [settings.mode] - The clock mode
	 */
	clock(settings) {
		settings = settings || {};
		this.config.clockMode = settings.mode || this.config.clockMode;
		this.config.showTime = (typeof settings.showTime === "boolean") ? settings.showTime : this.config.showTime;
		this.config.showWeather = (typeof settings.showWeather === "boolean") ? settings.showWeather : this.config.showWeather;
		this.config.showTemperature = (typeof settings.showTemperature === "boolean") ? settings.showTemperature : this.config.showTemperature;
		this.config.showCalendar = (typeof settings.showCalendar === "boolean") ? settings.showCalendar : this.config.showCalendar;
		this.config.color = settings.color || this.config.color;

		const message = [
			"450001",									// Command Prefix
			this._intHex(this.config.clockMode),
			this._boolHex(this.config.showTime),
			this._boolHex(this.config.showWeather),
			this._boolHex(this.config.showTemperature),
			this._boolHex(this.config.showCalendar),
			this._colorHex(this.config.color)
		].join("");
		return this._compile(this._assembleMessage(message));
	}

	// --- Lighting Mode --
	
	lighting(settings) {
		settings = settings || {};
		this.config.lightingMode = settings.mode || this.config.lightingMode;
		this.config.color = settings.color || this.config.color;
		this.config.brightness = settings.brightness || this.config.brightness;
		this.config.powerScreen = settings.powerScreen || this.config.powerScreen;

		const message = [
			"4501",										// Prefix for light
			this._colorHex(this.config.color),			// Color
			this._percentHex(this.config.brightness),	// Brightness from 0-100
			this._intHex(this.config.lightingMode),		// lighting mode
			this._boolHex(this.config.powerScreen),		// power
			"000000"									// suffix or functions?
		].join("");
		return this._compile(this._assembleMessage(message));
	}

	// --- Scoreboard channel ---

	score(settings) {
		settings = settings || {};
		this.config.redScore = settings.red || this.config.redScore;
		this.config.blueScore = settings.blue || this.config.blueScore;

		const message = [
			"450600",										// Prefix
			this._intLittleHex(Math.min(999, this.config.redScore)),		// score for red
			this._intLittleHex(Math.min(999, this.config.blueScore))		// score for blue
		].join("");
		return this._compile(this._assembleMessage(message));
	}
	
	// --- Effects channel ---

	effect(settings) {
		settings = settings || {};
		this.config.effectMode = settings.mode || this.config.effectMode;

		const message = [
			"4503",										// Prefix
			this._intHex(this.config.effectMode),		// visualization mode
		].join("");
		return this._compile(this._assembleMessage(message));
	}
	
	// --- Visualization channel ---

	visualization(settings) {
		settings = settings || {};
		this.config.visualizationMode = settings.mode || this.config.visualizationMode;

		const message = [
			"4504",											// Prefix
			this._intHex(this.config.visualizationMode),	// visualization mode
		].join("");
		return this._compile(this._assembleMessage(message));
	}
	
	// --- Cloud channel ---

	cloud(settings) {
		throw new Error("Cloud channel is not implemented yet.");
	}
	
	// --- Custom channel ---

	custom(settings) {
		throw new Error("Custom channel is not implemented yet.");
	}
	
	// --- Switch channels ---

	channel(settings) {
		settings = settings || {};
		settings.mode = settings.mode || "time";

		const modes = {
			clock: "00",
			lighting: "01",
			cloud: "02",
			effects: "03",
			visualization: "04",
			custom: "05",
			score: "06"
		};

		const message = [
			"45",
			modes[settings.mode] || "00"
		].join("");
		console.log("mode:", message);

		return this._compile(this._assembleMessage(message));
	}

	// --- Helper methods ---

	_intHex(int) {
		if (int > 255 || int < 0) {
			throw new Error("numberHex works only with number between 0 and 255");
		}
		return Math.round(int).toString(16).padStart(2, "0");
	}

	_intLittleHex(value) {
		if (value > 65535 || value < 0) {
			throw new TypeError("intLittleHex only supports value between 0 and 65535");
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
		let result = "";
		if (str.length % 2 !== 0) {
			throw new Error("The string length is not a multiple of 2");
		}
		for (let i = 0, l = str.length; i < l; i += 2) {
			var toHex = parseInt(str.substr(i, 2), 16);
			if (isNaN(toHex)) {
				throw new Error("str contains non hex character");
			}
			result += String.fromCharCode(toHex);
		}
		return result;
	}

	_assembleMessage(payload) {
		let lengthHS = this._intLittleHex((payload.length + 4) / 2);
		
		let msg = "" + lengthHS + payload;
		let sum = 0;
		for (var i = 0, l = msg.length; i < l; i+= 2) {
			sum += parseInt(msg.substr(i, 2), 16);
		}
		let crc = sum % 65536;
		let crcHS = this._intLittleHex(crc); 

		return [ "01", lengthHS, payload, crcHS, "02" ].join("");
	}

	_dissambleMessage(msg) {
		let answer = {};
		answer.ascii = msg;
		answer.crc = msg.slice(-6, msg.length - 2);
		answer.payloadLength = msg.slice(2, 6);
		answer.command = msg.slice(8, 10);
		answer.fixed = msg.slice(10, 12);
		answer.cmddata = msg.slice(12, msg.length - 6);
		return answer;
	}

	/**
	 * Create a binary buffer array from a hex message string.
	 *
	 * @param {string} message - The message string.
	 * @returns {Array} - An array of buffers ready to send to the device.
	 */
	_compile(message) {
		let buffers = [];
		message.match(/.{1,1332}/g).forEach(part => {
			buffers.push(Buffer.from(this._unHex(part), "binary"));
		});
		return buffers;
	}

	_decompile(buffer) {
		return buffer.toString("ascii");	
	}
}
