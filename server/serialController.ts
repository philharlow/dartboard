/* eslint-disable no-loop-func */
import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import gameController from './gameController';
import { handleInputSerialConnection } from './serialInputController';
import { handleLedSerialConnection } from './serialLedController';
import { range } from 'lodash';


const portOptionsWindows = range(1, 20).map(n => "COM" + n); // COM1-COM20
const portOptionsLinux = [...range(0, 5).map(n => "/dev/ttyUSB" + n), ...range(0, 5).map(n => "/dev/ttyACM" + n)]; // /dev/ttyUSB0-/dev/ttyUSB5, /dev/ttyACM0-/dev/ttyACM5
const paths = process.platform === "win32" ? portOptionsWindows : portOptionsLinux;
const serialPorts = [];

export let dartboardSerialConnection: SerialPort| undefined;
export let ledSerialConnection: SerialPort| undefined;

const retryTime = 10 * 1000;

const retry = (path: string) => {
    if (ledSerialConnection && dartboardSerialConnection) return;
    console.log("retyting port", path);
    tryPort(path);
    if (ledSerialConnection && dartboardSerialConnection) return;
    setTimeout(() => retry(path), retryTime);
};

const handleDisconnect = (port: SerialPort) => {
    if (port === dartboardSerialConnection) {
        console.log("dartboard disconnected", port.path);
        dartboardSerialConnection = undefined;
        retry(port.path);
    } else if (port === ledSerialConnection) {
        console.log("led disconnected", port.path);
        ledSerialConnection = undefined;
        retry(port.path);
    }
    port?.destroy();
};

const tryPort = (path: string) => {
    //console.log('trying serial port', path);
    try {
        const serialPort = new SerialPort({ path, baudRate: 115200 });
        serialPorts.push(serialPort);
        const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

        // Read the port data
        serialPort.on("open", () => {
            //console.log(`serial port ${path} open`);
        });
        serialPort.on("close", () => {
            cleanupPort(serialPort);
            handleDisconnect(serialPort);
            //console.log('serial port closed. retrying...');
        });
        serialPort.on("error", (message) => {
            cleanupPort(serialPort);
            //console.log('serial port error!!', message);
        });
        parser.on('data', (data: string) => {
            if (data.includes("OpenDarts")) {
                dartboardSerialConnection = serialPort;
                handleInputSerialConnection(serialPort, parser);
                gameController.updateConnections();
                console.log("found dartboard!", path);
                cleanup();
            } else if (data.includes("LedMatrix")) {
                ledSerialConnection = serialPort;
                handleLedSerialConnection(serialPort);
                gameController.updateConnections();
                console.log("found leds!", path);
                cleanup();
            }
            // else console.log("serial port", path, "got data", data);

        });

        const cleanupPort = (port: SerialPort) => {
            if (port && port !== ledSerialConnection && port !== dartboardSerialConnection) {
                port?.removeAllListeners();
                if (port?.isOpen)
                    port?.close();
                port?.destroy();
            }
        };

        const cleanup = () => {
            if (ledSerialConnection && dartboardSerialConnection) {
                serialPorts.forEach(cleanupPort);
            }
        };
    } catch (e) {}  
};

console.log('trying serial ports');
for(let i = 0; i < paths.length && !ledSerialConnection && !dartboardSerialConnection; i++) {
    const path = paths[i];
    tryPort(path);
}