import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import gameController from './gameController';
import calibrationController from './calibrationController';
import { Ring } from '../src/types/LedTypes';


export const handleInputSerialConnection = (serialPort: SerialPort, parser: ReadlineParser) => {
    parser.on('data', data =>{
        // console.log('handleInputSerialConnection data', data);

        if (data.includes("undo")) {
            // console.log('got undo');
            gameController.undoLastDart();
        } else if (data.includes("miss")) {
            // console.log('got miss');
            gameController.addDartThrow(0, Ring.Miss);
        } else if (data.includes("next")) {
            // console.log('got next');
            gameController.nextPlayer();
        } else if (data.includes(",")) {
            // console.log('got coordinate:', data);
            const coord = data.replace("\r", "");
            if (calibrationController.calibrationMode !== null) {
                calibrationController.handleDartMatrixHit(coord);
            } else {
                gameController.addDartMatrixHit(coord);
            }
        }
    });
}
