import { cloneDeep } from 'lodash';
import { CalibrationMode, DartThrow, GameStatus, GameType, parseDartCode, startingGameStatus, SelectedSetting, resetGameStatus } from '../src/types/GameTypes';
import { CalibrationMap, LedCalibrationMap, Ring } from '../src/types/LedTypes';
import { calibrationOrder, SocketEvent } from '../src/types/SocketTypes';
import { getDartCalibration, getLedCalibration, setDartCalibration, setLedCalibration } from './dbController';
import GameBase from './gameTypes/GameBase';
import { gameList } from './gameTypes/GamesList';
import ledController from './LedController';
import { ledCalibrationStep, ledsConnected } from './serialLedController';
import { socketServer } from './socketServer';
import { defaultPlayers } from '../src/types/PlayerTypes';
import { dartboardConnected } from './serialController';

const dartCalibration: CalibrationMap = getDartCalibration();
export const ledCalibration: LedCalibrationMap = getLedCalibration();
console.log("Loaded calibrations", Object.keys(dartCalibration).length, Object.keys(ledCalibration).length);

const ROWS = 8;


class GameController {
    currentGame?: GameBase;
    
    allPlayers = defaultPlayers;
    gameStatus: GameStatus = cloneDeep(startingGameStatus);
    calibrationStep: number | null = null;

    init() {
        this.updateCalibrationState();
    }

    updateCalibrationState() {
        const mode = this.getCalibrationMode();
        if (mode === null) {
            this.updateGameStatus({ calibrationState: null});
        } else {
            this.updateGameStatus({ calibrationState: { mode, step: this.calibrationStep }});
        }
    }

    getCalibrationMode() {
        if (Object.keys(dartCalibration).length < calibrationOrder.length) return CalibrationMode.Dartboard;
        if (Object.keys(ledCalibration).length < calibrationOrder.length) return CalibrationMode.Leds;
        return null;
    }

    startGame(gameType: GameType) {
        console.log('startGame:', gameType);
        if (this.currentGame) {
            this.currentGame.exiting();
            this.reset();
        }
        this.currentGame = gameList.find(game => game.gameDef.gameType === gameType);
        this.currentGame?.starting();
        this.updateGameStatus({ currentGameType: gameType, currentGameName: undefined });
    }
    
    setSettings(settings: SelectedSetting[]) {
        console.log('starsetSettingstGame:', settings);
        this.updateGameStatus({ selectedSettings: settings });
        if (settings.length > 0)
            this.currentGame?.setOptions();
    }

    setPlayers(players: string[]) {
        console.log('setPlayers:', players);
        this.updateGameStatus({ players, waitingForThrow: true });
        this.currentGame?.playersSet();
        this.currentGame?.waitingForThrowSet();
    }

    addDartThrow(score: number, ring: Ring) {
        //console.log("handling dart", score, ring);
        if (this.currentGame)
            this.currentGame.addDartThrow(score, ring);
        else
            ledController.flashLed(score, ring);
    }

    nextPlayer() {
        this.currentGame?.nextPlayer();
    }

    undoLastDart() {
        this.currentGame?.undoLastDart();
    }

    setDartThrows(darts: DartThrow[]) {
        this.updateGameStatus({ dartThrows: darts });
    }

    reset() {
        this.updateGameStatus(cloneDeep(resetGameStatus));
    }
    

    updateGameStatus(changes: Partial<GameStatus>) {
        Object.assign(this.gameStatus, changes);
        socketServer.emit(SocketEvent.UPDATE_GAME_STATUS, changes);
    }

    updateConnections() {
        const connections = { leds: ledsConnected, dartboard: dartboardConnected };
        this.updateGameStatus({connections});
    }

    startCalibration = () => {
        this.calibrationStep = -1;
        this.nextCalibrationStep();
    };

    clearCalibration = (darts: boolean) => {
        this.calibrationStep = null;
        if (darts) {
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
        this.calibrationStep += 1;
        this.updateCalibrationState();
        console.log("nextCalibration", this.gameStatus.calibrationState, this.calibrationStep)
        if (this.gameStatus.calibrationState.mode === CalibrationMode.Dartboard) {
            //console.log("nextCalibration", this.calibrationStep)
            // Turn off last led
            const lastStep = this.calibrationStep - 1;
            if (lastStep >= 0) {
                const { score, ring } = parseDartCode(calibrationOrder[lastStep]);
                ledController.setSingleLedOn(score, ring, false);
            }
            socketServer.emit(SocketEvent.SET_CALIBRATION_STEP, this.calibrationStep);
            this.updateCalibrationState();
            if (this.calibrationStep >= calibrationOrder.length) {
                console.log("finished calibration!");
                
                return;
            }
            //console.log("nextCalibration", this.calibrationStep, calibrationOrder[this.calibrationStep])
            const { score, ring } = parseDartCode(calibrationOrder[this.calibrationStep]);
            ledController.setSingleLedOn(score, ring, true);
        }
        if (this.gameStatus.calibrationState.mode === CalibrationMode.Leds) {
            socketServer.emit(SocketEvent.SET_CALIBRATION_STEP, this.calibrationStep);
            if (this.calibrationStep >= calibrationOrder.length + 2) { // 2 extra for extra bullseye leds
                console.log("finished led calibration!");
                
                return;
            }

                this.updateCalibrationState();
            ledCalibrationStep(this.calibrationStep);
        }
    }

    addDartMatrixHit(coord: string) {
        if (this.gameStatus.calibrationState.mode === CalibrationMode.Dartboard) {
            dartCalibration[coord] = calibrationOrder[this.calibrationStep];
            setDartCalibration(dartCalibration);
            //console.log("dartCalibration:", dartCalibration);
            this.nextCalibrationStep();
        } else if (this.gameStatus.calibrationState.mode === CalibrationMode.Leds) {
            const dartCode = dartCalibration[coord];
            ledCalibration[dartCode] = [ ...(ledCalibration[dartCode] || []), { row: Math.floor(this.calibrationStep / ROWS), col: this.calibrationStep % ROWS }];
            setLedCalibration(ledCalibration);
            // console.log("ledCalibration:", ledCalibration);
            this.nextCalibrationStep();
        } else {
            const dartCode = dartCalibration[coord];
            //console.log("got matrix hit:", dartCode, coord)
            const { score, ring } = parseDartCode(dartCode);
            this.addDartThrow(score, ring);
        }
    }

}

const gameController = new GameController();

export default gameController;