p1x3lramen
================================================================================

Using an HTTP server to send pixel soup to a Divoom Pixoo LED panel over a
bluetooth connection.

--------------------------------------------------------------------------------

**WARNING:** This is experimental and runs an unsecured HTTP server with an
unvalidated API on port 8000. Use at your own risk and try to understand what
it does.

--------------------------------------------------------------------------------

This is meant to expose all functions of the device like a prototyping pegboard
so you can tinker with the device and create awesome things. pixelramen can be
used as app and accessing it over port 8000 or by using the ES6 modules directly.


Usage
--------------------------------------------------------------------------------

The divoom pixoo uses bluetooth 5 so a computer with support for that would be
a requirement.

This app is written in JavaScript for node so you need
[Node.js](https://nodejs.org/en/) installed. 

### Pair the pixoo

You need to pair the pixoo with your computer. 

When using a Mac like I do, Open Bluetooth Preferences, switch on the pixoo and
connect it as soon as it apears in the Preferences.

I have no idea how the pairing works on other systems, but it's probably
similar.

### Running the app

Open a terminal (yea, doesn't work without it), clone the project from github
and install the dependencies:

```sh
git clone https://github.com/jfroehlich/node-p1x3lramen
cd node-p1x3lramen
npm install
```

Then start the app:

```sh
node index.js
```

This will start the http server. Open `localhost:8000` in a browser. This
should auto connect to the device. You can disconnect by using the HTTP API or by
killing the app with `ctrl-c`.


Testing
--------------------------------------------------------------------------------

I did write some tests to run them one after each other. You can run them with
the web server with a configureable delay after each test.

First connect to the device with `/connect` in the browser. When connected call 
`/test?delay=2000`. The number is the delay in milliseconds.


Why this project?
--------------------------------------------------------------------------------

I got a Divoom Pixoo for christmas in 2020 but couldn't use it since Divoom
only has a smartphone app and the pixoo only connects over bluetooth 5 which my
smarphone didn't support. I didn't get the perl and python scripts to run but
there is [an implementation for the timebox evo][1] which happens to (mostly) have
the same API as the pixoo.

The timebox evo script is realy cool but it connects and disconnects for each
cli command, is actually for the evo, is a bit complicated and I don't like
type script that much. So, I decided to write my own little app. Feel free to
use it and get inspired.

HTTP API
--------------------------------------------------------------------------------

This is a quick documentation of the HTTP API. For the range of values look at
`source/devices/pxioo.js` for now. 

- `/api/status` returns the current connection status and the app configuration
  for the device

- `/api/connect` Connect to the device

- `/api/disconnect` Disconnect from the device

- `/api/fullday?enable=<bool>` Switches between 12h and 24h mode. Note: Does
  work, but not as expected -- don't know why.

- `/api/datetime?date=<isodate>&fullday=<bool>` Updates the time and switches
  between 12h and 24h mode

- `/api/brightness?level=<num>` Sets the brightness level

- `/api/lighting?color=<hexcolor>&brightness=<num>&mode=<num>&powerScreen=<bool>`
  Sets the color and brightness or switches the screen off

- `/api/clock?mode=<num>&showTime=<bool>&showWeather=<bool>&showTemperature=<bool>&showCalendar=<bool>&color=<hexcolor>`
  Switches between clock modes and sets it's config

- `/api/score?red=<num>&blue=<num>` Switches to score mode and sets the scores
  for red and blue

- `/api/visualization?mode=<num>`

- `/api/effect?mode=<num>`

- `/api/climate?weather=<num>&temperature=<num>` Set the weather and temperature

- `/api/test` A very basic integration test.


References
--------------------------------------------------------------------------------

This project is build using the ingenuity of many others:

- [github: node-timebox-evo][1]
- [Thread about Divoom Devices in the FHEM forum (de)](https://forum.fhem.de/index.php?topic=81593.0)
- [github: divoom timebox/aurabox fhem lib in perl](https://github.com/mumpitzstuff/fhem-Divoom)


[1]: https://github.com/RomRider/node-divoom-timebox-evo


