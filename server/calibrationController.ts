import { CalibrationMode, parseDartCode, CalibrationState } from '../src/types/GameTypes';
import { CalibrationMap, LedCalibrationMap } from '../src/types/LedTypes';
import { calibrationOrder, GameEvent, SocketEvent, SoundFX } from '../src/types/SocketTypes';
import { getDartCalibration, getLedCalibration, setDartCalibration, setLedCalibration } from './dbController';
import gameController from './gameController';
import ledController from './ledController';
import { ledCalibrationStep } from './serialLedController';
import { playSound, socketServer, speak } from './socketServer';


const clearObject = (obj: any) => {
    for (const key of Object.keys(obj))
        delete obj[key];
}

export const dartCalibration: CalibrationMap = getDartCalibration();
export const ledCalibration: LedCalibrationMap = getLedCalibration();

if (Object.keys(dartCalibration).length !== calibrationOrder.length) clearObject(dartCalibration);
if (Object.keys(ledCalibration).length !== calibrationOrder.length) clearObject(ledCalibration);
console.log("Loaded calibrations", Object.keys(dartCalibration).length, Object.keys(ledCalibration).length);


const ROWS = 8;
const extraBullseyeLeds = 2;

class CalibrationController {
    calibrationMode: CalibrationMode | null = null;
    calibrationStep: number | null = null;

    init() {
        if (!Object.keys(dartCalibration).length) this.calibrationMode = CalibrationMode.Dartboard;
        if (!Object.keys(ledCalibration).length) this.calibrationMode = CalibrationMode.Leds;

        this.updateCalibrationState();
    }

    updateCalibrationState() {
        gameController.updateGameStatus({ calibrationState: this.getCalibrationState() });
    }

    getCalibrationState(): CalibrationState | null {
        if (this.calibrationMode === null) return null;
        return { mode: this.calibrationMode, step: this.calibrationStep };
    }

    startCalibration = () => {
        this.calibrationStep = -1; // next will increment to 0
        this.nextCalibrationStep();
        if (this.calibrationMode === CalibrationMode.Dartboard)
            speak("Starting dartboard calibration. Press the button on the dartboard as shown on your screen.");
        else
            speak("Starting LED calibration. Press the button on the dartboard that is illuminated.");
    };

    clearCalibration = (mode: CalibrationMode) => {
        this.calibrationStep = null;
        if (mode === CalibrationMode.Dartboard) {
            for (const key in dartCalibration) delete dartCalibration[key];
            setDartCalibration(dartCalibration);
        } else {
            for (const key in ledCalibration) delete ledCalibration[key];
            setLedCalibration(ledCalibration);
        }
        ledController.setAllOn(false);
        console.log("calibrations cleared");
        this.updateCalibrationState();
    }

    nextCalibrationStep() {
        if (this.calibrationStep === null) return;

        this.calibrationStep += 1;
        this.updateCalibrationState();

        console.log("current mode and step", this.calibrationMode, this.calibrationStep)

        if (this.calibrationMode === CalibrationMode.Dartboard) {
            //console.log("nextCalibration", this.calibrationStep)
            // Turn off last led
            socketServer.emit(GameEvent.SET_CALIBRATION_STEP, this.calibrationStep);
            const { score, ring } = parseDartCode(calibrationOrder[this.calibrationStep]);
            ledController.setSingleLedOn(score, ring, true);
        } else if (this.calibrationMode === CalibrationMode.Leds) {
            socketServer.emit(GameEvent.SET_CALIBRATION_STEP, this.calibrationStep);
            //this.updateCalibrationState();
            ledCalibrationStep(this.calibrationStep);
        }
    }

    finishCalibration = () => {
        playSound(SoundFX.SUCCESS);
        ledController.setAllOn(false, true);
        if (this.calibrationMode === CalibrationMode.Dartboard) {
            console.log("finished dart calibration!");
            // Move on to leds even if we finished dartboard calibration
            this.calibrationMode = CalibrationMode.Leds;
            this.calibrationStep = -1;
            this.nextCalibrationStep();
        } else {
            console.log("finished led calibration!");
            this.calibrationMode = null;
            this.calibrationStep = null;
            this.updateCalibrationState();
        }
    }

    handleDartMatrixHit(coord: string) {
        if (this.calibrationMode === CalibrationMode.Dartboard) {
            dartCalibration[coord] = calibrationOrder[this.calibrationStep];
            setDartCalibration(dartCalibration);
            //console.log("dartCalibration:", dartCalibration);
            if (this.calibrationStep >= 0) {
                const { score, ring } = parseDartCode(calibrationOrder[this.calibrationStep]);
                ledController.setSingleLedOn(score, ring, false);
            }
            if (this.calibrationStep >= calibrationOrder.length - 1) {
                this.finishCalibration();
            } else {
                this.nextCalibrationStep();
            }
        } else if (this.calibrationMode === CalibrationMode.Leds) {
            const dartCode = dartCalibration[coord];
            const ledCoord = { row: Math.floor(this.calibrationStep / ROWS), col: this.calibrationStep % ROWS };
            ledCalibration[dartCode] = [ ...(ledCalibration[dartCode] || []), ledCoord];
            setLedCalibration(ledCalibration);
            console.log("ledCalibration:", Object.keys(ledCalibration).length);
            if (this.calibrationStep >= calibrationOrder.length + extraBullseyeLeds - 1) { // 2 extra for extra bullseye leds
                this.finishCalibration();
            } else {
                this.nextCalibrationStep();
            }
        }
    }

}

const calibrationController = new CalibrationController();

export default calibrationController;