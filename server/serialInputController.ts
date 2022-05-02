import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import gameController from './gameController';
import calibrationController from './calibrationController';
import { Ring } from '../src/types/LedTypes';


export const handleInputSerialConnection = (serialPort: SerialPort, parser: ReadlineParser) => {
    parser.on('data', data =>{
        if (data.includes(",")) {
            // console.log('got coordinate:', data);
            const coord = data.replace("\r", "");
            if (calibrationController.calibrationMode !== null) {
                calibrationController.handleDartMatrixHit(coord);
            } else {
                gameController.addDartMatrixHit(coord);
            }
        } else if (data.includes("miss")) {
            console.log('got miss');
            gameController.addDartThrow(0, Ring.Miss);
        }
    });
}
