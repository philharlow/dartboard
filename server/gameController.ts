import { cloneDeep } from 'lodash';
import { DartThrow, GameStatus, GameType, parseDartCode, SelectedSetting } from '../src/types/GameTypes';
import { CalibrationMap, Ring } from '../src/types/LedTypes';
import { calibrationOrder, SocketEvent } from '../src/types/SocketTypes';
import { getDartCalibration, getLedCalibration, setDartCalibration, setLedCalibration } from './dbController';
import GameBase from './gameTypes/GameBase';
import { gameList } from './gameTypes/GamesList';
import ledController from './LedController';
import { socketServer } from './sockerServer';

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
    calibrated: [false, false],
};

const dartCalibration: CalibrationMap = getDartCalibration();
const ledCalibration: CalibrationMap = getLedCalibration();
console.log("Loaded calibrations", Object.keys(dartCalibration).length, Object.keys(ledCalibration).length);


class GameController {
    currentGame?: GameBase;
    
    gameStatus: GameStatus = cloneDeep(resetGameStatus);
    calibrationStep: number = 0;

    init() {
        this.calibrationStep = Object.keys(dartCalibration).length;
        this.updateCalibrationState();
    }

    updateCalibrationState() {
        this.updateGameStatus({ calibrated: [
            Object.keys(dartCalibration).length >= calibrationOrder.length,
            Object.keys(ledCalibration).length >= calibrationOrder.length
        ]});
    }

    startGame(gameType: GameType) {
        console.log('startGame:', gameType);
        if (this.currentGame) {
            this.currentGame.exiting();
            this.reset();
        }
        this.currentGame = gameList.find(game => game.gameDef.gameType === gameType);
        this.currentGame?.starting();
        this.updateGameStatus({ currentGameType: gameType });
    }
    
    setSettings(settings: SelectedSetting[]) {
        console.log('starsetSettingstGame:', settings);
        this.updateGameStatus({ selectedSettings: settings });
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
        this.calibrationStep = -1;
        for (const key in dartCalibration) delete dartCalibration[key];
        for (const key in ledCalibration) delete ledCalibration[key];
        setDartCalibration(dartCalibration);
        setLedCalibration(ledCalibration);
        ledController.setAllOn(false);
        console.log("calibrations cleared");
        this.updateCalibrationState();
    }

    nextCalibrationStep() {
        //console.log("nextCalibration", this.calibrationStep)
        // Turn off last led
        this.calibrationStep++;
        if (this.calibrationStep > 0) {
            const { score, ring } = parseDartCode(calibrationOrder[this.calibrationStep - 1]);
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

    addDartMatrixHit(coord: string) {
        if (this.calibrationStep >= calibrationOrder.length) {
            const dartCode = dartCalibration[coord];
            //console.log("got matrix hit:", dartCode, coord)
            const { score, ring } = parseDartCode(dartCode);
            this.addDartThrow(score, ring);
            return;
        }
        dartCalibration[coord] = calibrationOrder[this.calibrationStep];
        setDartCalibration(dartCalibration);
        //console.log("dartCalibration:", dartCalibration);
        this.nextCalibrationStep();

    }

}

const gameController = new GameController();

export default gameController;