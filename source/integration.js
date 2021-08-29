/* eslint-env node */
/**
 * Clock channel integration tests.
 *
 * Switches through clock features on the device.
 */
export async function testClockIntegration(device, connection, delay) {
	let message = null;

	console.log("[TEST] Switching to clock..");
	message = device.clock();
	console.log(message)
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] Show weather only.");
	message = device.clock({mode: 0, showTime: false, showWeather: true, showTemperature: false, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] Show temperature only.");
	message = device.clock({mode: 0, showTime: false, showWeather: false, showTemperature: true, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] Show calendar only.");
	message = device.clock({mode: 0, showTime: false, showWeather: false, showTemperature: false, showCalendar: true, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
	
	console.log("[TEST] rainbow");
	message = device.clock({mode: 1, showTime: true, showWeather: false, showTemperature: false, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] rainbow");
	message = device.clock({mode: 2, showTime: true, showWeather: false, showTemperature: false, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	console.log("[TEST] analog square");
	message = device.clock({mode: 3, showTime: true, showWeather: false, showTemperature: false, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] fullscreen negative");
	message = device.clock({mode: 4, showTime: true, showWeather: false, showTemperature: false, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] analog round");
	message = device.clock({mode: 5, showTime: true, showWeather: false, showTemperature: false, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] widescreen");
	message = device.clock({mode: 6, showTime: true, showWeather: false, showTemperature: false, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
}

export async function testLigtingIntegration(device, connection, delay) {
	let message = null;

	console.log("[TEST] Switching to blue color...");
	message = device.lighting({mode: 0, color: '0000ff', powerScreen: true});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
	
	console.log("[TEST] Switching screen off...");
	message = device.lighting({powerScreen: false});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] Switching screen on...");
	message = device.lighting({powerScreen: true});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] Love lightning...");
	message = device.lighting({mode: 1});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] Plant lightning ...");
	message = device.lighting({mode: 2});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] no-mosquito lightning ...");
	message = device.lighting({mode: 3});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log("[TEST] sleep lightning ...");
	message = device.lighting({mode: 4});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
}

// Basic commands

export async function testBrightnessIntegration(device, connection, delay) {
	let message = null;

	console.log("[PREP] Switching to white color...");
	message = device.lighting({color: 'ffffff', brightness: 0});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}
	
	// switch through brightness
	for (let i = 1; i <= 10; i++) {
		console.log("[TEST] Switching brightness to", i*10);
		message = device.brightness({level: i*10});
		for (let buffer of message) {
			console.log('=>', buffer);
			console.log('length:', await connection.write(buffer));
		}
		await connection._sleep(delay);
	}
	console.log("[RESET] Switching brightness to", 50);
	message = device.brightness({level: 50});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
}

export async function testDateTimeIntegration(device, connection, delay) {
	let message = null;

	console.log("[PREP] Switching to clock..");
	message = device.clock();
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	console.log('[PREP] Setting the current time');
	message = device.datetime();
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log('[TEST] Setting the time to 2006-09-18T12:34:00');
	message = device.datetime({date: new Date('2006-09-18T12:34:00')});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);

	console.log('[TEST] Setting the current time');
	message = device.datetime(new Date());
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
}

export async function testClimateIntegration(device, connection, delay) {
	let message = null;

	console.log("[PREP] Switching to clock..");
	message = device.clock({mode: 0, showTime: true, showWeather: true, showTemperature: true, showCalendar: false, color: 'ffffff'});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
	
	console.log("[TEST] cloudy, 0 degrees");
	message = device.climate({weather: 1, temperature: 0});
	for (let buffer of message) {
		console.log('=>', buffer);
		console.log('length:', await connection.write(buffer));
	}

	await connection._sleep(delay);
}
