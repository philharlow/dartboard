import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import gameController from './gameController';
import { forceCooldown } from './gpioController';

const retryTime = 10 * 1000;
let retriesLeft = 10;
let port: SerialPort| undefined;
let parser: ReadlineParser | undefined;

export let dartboardConnected = false;

export const openSerialConnection = () => {
    if (port) {
        console.log('openSerialConnection() already has port!');
        return;
    }
    const path = process.platform === "win32" ? "COM20" : "/dev/ttyUSB0";
    console.log('opening serial on', path);
    port = new SerialPort({ path, baudRate: 115200 });
    parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
    // Read the port data
    port.on("open", () => {
        console.log('serial port open');
        retriesLeft = 10;
        dartboardConnected = true;
        gameController.updateConnections();
    });
    const retryConnection = () => {
        port?.destroy();
        port = undefined;
        parser = undefined;
        if (retriesLeft && retriesLeft--) {
            setTimeout(openSerialConnection, retryTime);
        }
    };
    port.on("close", () => {
        if (!port) return;
        console.log('serial port closed. retrying...');
        dartboardConnected = false;
        gameController.updateConnections();
        retryConnection();
    });
    port.on("error", (message) => {
        console.log('serial port error!!', message, "retriesLeft:", retriesLeft);
        dartboardConnected = false;
        gameController.updateConnections();
        retryConnection();
    });
    parser.on('data', data =>{
        if (data.includes(",")) {
            // console.log('got coordinate:', data);
            forceCooldown();
            gameController.addDartMatrixHit(data.replace("\r", ""));
        }
    });
}
