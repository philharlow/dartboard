import { cloneDeep } from 'lodash';
import { CalibrationMode, DartThrow, GameStatus, GameType, parseDartCode, SelectedSetting } from '../src/types/GameTypes';
import { CalibrationMap, LedCalibrationMap, Ring } from '../src/types/LedTypes';
import { calibrationOrder, SocketEvent } from '../src/types/SocketTypes';
import { getDartCalibration, getLedCalibration, setDartCalibration, setLedCalibration } from './dbController';
import GameBase from './gameTypes/GameBase';
import { gameList } from './gameTypes/GamesList';
import ledController from './LedController';
import { ledCalibrationStep } from './serialLedController';
import { socketServer } from './sockerServer';
import { defaultPlayers } from '../src/types/PlayerTypes';

const resetGameStatus: GameStatus = {
    currentGameType: GameType.None,
    players: [],
    scores: [],
    dartThrows: [],
    currentRound: 0,
    waitingForThrow: false,
    currentPlayerIndex: 0,
    winningPlayerIndex: -1,
    selectedSettings: [],
    calibrationMode: CalibrationMode.None,
};

const dartCalibration: CalibrationMap = getDartCalibration();
export const ledCalibration: LedCalibrationMap = getLedCalibration();
console.log("Loaded calibrations", Object.keys(dartCalibration).length, Object.keys(ledCalibration).length);

const ROWS = 8;


class GameController {
    currentGame?: GameBase;
    
    allPlayers = defaultPlayers;
    gameStatus: GameStatus = cloneDeep(resetGameStatus);
    calibrationStep: number = 0;

    init() {
        this.calibrationStep = (Object.keys(dartCalibration).length + Object.keys(ledCalibration).length) % calibrationOrder.length;
        this.updateCalibrationState();
    }

    updateCalibrationState() {
        this.updateGameStatus({ calibrationMode: this.getCalibrationMode()});
    }

    getCalibrationMode() {
        if (Object.keys(dartCalibration).length < calibrationOrder.length) return CalibrationMode.Dartboard;
        if (Object.keys(ledCalibration).length < calibrationOrder.length) return CalibrationMode.Leds;
        return CalibrationMode.None;
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
            /*

        gameController.addDartThrow(score, ring);
        this.gameStatus.dartThrows.push({
            bust: false,
            multiplier: 1,
            player: "",
            ring,
            round: 1,
            score,
            totalScore: score
        })
        */
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
        this.updateCalibrationState();
    }
    

    updateGameStatus(changes: Partial<GameStatus>) {
        Object.assign(this.gameStatus, changes);
        socketServer.emit(SocketEvent.UPDATE_GAME_STATUS, changes);
    }

    clearCalibration = () => {
        this.calibrationStep = 0;
        for (const key in dartCalibration) delete dartCalibration[key];
        for (const key in ledCalibration) delete ledCalibration[key];
        setDartCalibration(dartCalibration);
        setLedCalibration(ledCalibration);
        ledController.setAllOn(false);
        console.log("calibrations cleared");
        this.updateCalibrationState();
    }

    lastStep = 0;
    nextCalibrationStep() {
        console.log("nextCalibration", this.gameStatus.calibrationMode, this.calibrationStep)
        if (this.gameStatus.calibrationMode === CalibrationMode.Dartboard) {
            //console.log("nextCalibration", this.calibrationStep)
            // Turn off last led
            if (this.lastStep >= 0) {
                const { score, ring } = parseDartCode(calibrationOrder[this.lastStep]);
                ledController.setSingleLedOn(score, ring, false);
            }
            socketServer.emit(SocketEvent.SET_CALIBRATION_STEP, this.calibrationStep);
            if (this.calibrationStep >= calibrationOrder.length) {
                console.log("finished calibration!");
                
                this.updateCalibrationState();
                return;
            }
            //console.log("nextCalibration", this.calibrationStep, calibrationOrder[this.calibrationStep])
            const { score, ring } = parseDartCode(calibrationOrder[this.calibrationStep]);
            ledController.setSingleLedOn(score, ring, true);
        }
        if (this.gameStatus.calibrationMode === CalibrationMode.Leds) {
            socketServer.emit(SocketEvent.SET_CALIBRATION_STEP, this.calibrationStep);
            if (this.calibrationStep >= calibrationOrder.length + 2) { // 2 extra for extra bullseye leds
                console.log("finished led calibration!");
                
                this.updateCalibrationState();
                return;
            }

            ledCalibrationStep(this.calibrationStep);
        }
    }

    addDartMatrixHit(coord: string) {
        if (this.gameStatus.calibrationMode === CalibrationMode.Dartboard) {
            dartCalibration[coord] = calibrationOrder[this.calibrationStep];
            setDartCalibration(dartCalibration);
            //console.log("dartCalibration:", dartCalibration);
            this.calibrationStep++;
            this.nextCalibrationStep();
        } else if (this.gameStatus.calibrationMode === CalibrationMode.Leds) {
            const dartCode = dartCalibration[coord];
            ledCalibration[dartCode] = [ ...(ledCalibration[dartCode] || []), { row: Math.floor(this.calibrationStep / ROWS), col: this.calibrationStep % ROWS }];
            setLedCalibration(ledCalibration);
            // console.log("ledCalibration:", ledCalibration);
            this.calibrationStep++;
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