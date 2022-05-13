import { SerialPort } from 'serialport';
import { ledCalibration } from './calibrationController';
import { LedButton, LedsObj } from '../src/types/LedTypes';

let serialPort: SerialPort | undefined;

export const handleLedSerialConnection = (port: SerialPort) => {
    serialPort = port;
}

const leds = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const buttonLeds = [false, false, false]; // undo, miss, next

//BufferEncoding = 'ascii' | 'utf8' | 'utf-8' | 'utf16le' | 'ucs2' | 'ucs-2' | 'base64' | 'base64url' | 'latin1' | 'binary' | 'hex'
export const writeLedsToSerial = () => {
    // TODO fix this on arduino side
    //const output = "b" + arr.map(val => String.fromCharCode(val)).join("") + "\n";
    const output = "a" + leds.map(val => val).join(",") + "\n";
    // console.log("writing leds. length:", arr.length, output);
    serialPort?.write(output);
}

export const writeButtonLedsToSerial = () => {
    const value = getButtonLedsValue();
    const output = "e" + value + "\n";
    //console.log("writing button leds:", output);
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
    if (write) writeLedsToSerial();
}

export const updateFromLedObj = (ledsObj: LedsObj) => {
    for (const key of Object.keys(ledsObj))
        ledOn(key, ledsObj[key].on);
    writeLedsToSerial();
}

export const setButtonLedOn = (button: LedButton, on: boolean) => {
    buttonLeds[button] = on;
}

export const getButtonLedOn = (button: LedButton) => {
    return buttonLeds[button];
}

export const getButtonLedsValue = () => {
    const value = (buttonLeds[0] ? 1 : 0) + (buttonLeds[1] ? 2 : 0) + (buttonLeds[2] ? 4 : 0);
    return value;
}

const ROWS = 11;
const COLS = 8;

let lastStep = 0;
export const ledCalibrationStep = (step: number) => {
    const lastRow = Math.floor(lastStep / COLS) % ROWS;
    const lastCol = (lastStep % COLS);
    const currentRow = Math.floor(step / COLS) % ROWS;
    const currentCol = (step % COLS);
    leds[lastRow] = leds[lastRow] & ~(1 << lastCol);
    leds[currentRow] = leds[currentRow] | (1 << currentCol);
    lastStep = step;
    //console.log("leds", leds);
    //console.log("led at", leds.length, Math.floor(pos / COLS) % ROWS, pos % COLS);
    writeLedsToSerial();
}
