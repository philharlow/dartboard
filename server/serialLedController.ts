import { SerialPort } from 'serialport';
import { ledCalibration } from './calibrationController';
import { LedsObj } from '../src/types/LedTypes';

let serialPort: SerialPort | undefined;

export const handleLedSerialConnection = (port: SerialPort) => {
    serialPort = port;
}

const leds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

//BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex'
export const writeToLedController = (arr: number[]) => {
    // TODO fix this on arduino side
    //const output = "b" + arr.map(val => String.fromCharCode(val)).join("") + "\n";
    const output = "a" + arr.map(val => val).join(",") + "\n";
    // console.log("writing leds. length:", arr.length, output);
    // port?.flush();
    serialPort?.write(output);
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

const ROWS = 11;
const COLS = 8;

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
