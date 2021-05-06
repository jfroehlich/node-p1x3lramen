pixelramen
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
git clone https://github.com/jfroehlich/pixelramen
cd pixelramen
npm install
```

Then start the app:

```sh
node index.js
```

This will start the http server. Open `localhost:8000` in a browser. This
should auto connect to the device. You can disconnect by using the HTTP API or by
killing the app with `ctrl-c`.


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

[1]: https://github.com/RomRider/node-divoom-timebox-evo


