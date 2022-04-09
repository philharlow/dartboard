import { SerialPort } from 'serialport';
import { ledCalibration } from './gameController';
import { LedsObj } from '../src/types/LedTypes';

const retryTime = 10 * 1000;
let retriesLeft = 10;
let port: SerialPort | undefined;

export const openLedSerialConnection = () => {
    if (port) {
        console.log('openLedSerialConnection() already has port!');
        return;
    }
    const path = process.platform === "win32" ? "COM4" : "/dev/ttyACM1";
    console.log('opening led serial on', path);
    port = new SerialPort({ path, baudRate: 115200 });
    // Read the port data
    port.on("open", () => {
        console.log('led serial port open');
        retriesLeft = 10;

    });
    const retryConnection = () => {
        port?.destroy();
        port = undefined;
        if (retriesLeft && retriesLeft--) {
            setTimeout(openLedSerialConnection, retryTime);
        }
    };
    port.on("close", () => {
        if (!port) return;
        console.log('led serial port closed. retrying...');
        retryConnection();
    });
    port.on("error", (message) => {
        console.log('led serial port error!!', message, "retriesLeft:", retriesLeft);
        retryConnection();
    });
}

const leds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex'
export const writeToLedController = (arr: number[]) => {
    // TODO fix this on arduino side
    //const output = "b" + arr.map(val => String.fromCharCode(val)).join("") + "\n";
    const output = "a" + arr.map(val => val).join(",") + "\n";
    // console.log("writing leds. length:", arr.length, output);
    // port?.flush();
    port?.write(output);
}

export const ledOn = (dartCode: string, on = true, write = false) => {
    if (!ledCalibration[dartCode]) return;
    const leds = ledCalibration[dartCode];
    for (const { row, col } of leds)
        ledOnRowCol(row, col, on, write);
}

export const ledOnRowCol = (row: number, col: number, on = true, write = false) => {
    if (on) leds[row] = leds[row] | (1 << col);
    else leds[row] = leds[row] & ~(1 << col);
    if (write) writeToLedController(leds);
}

export const updateFromLedObj = (ledsObj: LedsObj) => {
    for (const key of Object.keys(ledsObj))
        ledOn(key, ledsObj[key].on);
    writeToLedController(leds);
}

let pos = 0;
const ROWS = 11;
const COLS = 8;
/*
setInterval(() => {
    leds[Math.floor(pos / COLS) % ROWS] = leds[Math.floor(pos / COLS) % ROWS] & ~(1 << (pos % COLS));
    if (pos + 1 >= ROWS * COLS) pos = 0;
    else pos++;
    leds[Math.floor(pos / COLS) % ROWS] = leds[Math.floor(pos / COLS) % ROWS] | (1 << (pos % COLS));
    //console.log("leds", leds);
    //console.log("led at", leds.length, Math.floor(pos / COLS) % ROWS, pos % COLS);
    writeToLedController(leds);
}, 100);
*/

let lastStep = 0;
export const ledCalibrationStep = (step: number) => {
    leds[Math.floor(lastStep / COLS) % ROWS] = leds[Math.floor(lastStep / COLS) % ROWS] & ~(1 << (lastStep % COLS));
    leds[Math.floor(step / COLS) % ROWS] = leds[Math.floor(step / COLS) % ROWS] | (1 << (step % COLS));
    lastStep = step;
    //console.log("leds", leds);
    //console.log("led at", leds.length, Math.floor(pos / COLS) % ROWS, pos % COLS);
    writeToLedController(leds);
    return 0;
}