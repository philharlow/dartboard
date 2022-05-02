import { cloneDeep } from 'lodash';
import { DartThrow, GameStatus, GameType, parseDartCode, startingGameStatus, SelectedSetting, resetGameStatus } from '../src/types/GameTypes';
import { SocketEvent } from '../src/types/SocketTypes';
import GameBase from './gameTypes/GameBase';
import { gameList } from './gameTypes/GamesList';
import ledController from './LedController';
import { socketServer } from './socketServer';
import { defaultPlayers } from '../src/types/PlayerTypes';
import { dartboardSerialConnection, ledSerialConnection } from './serialController';
import { dartCalibration } from './calibrationController';
import { Ring } from '../src/types/LedTypes';


class GameController {
    currentGame?: GameBase;
    
    allPlayers = defaultPlayers;
    gameStatus: GameStatus = cloneDeep(startingGameStatus);

    init() {
        
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
        const connections = {
            leds: ledSerialConnection !== undefined,
            dartboard: dartboardSerialConnection !== undefined
        };
        this.updateGameStatus({connections});
    }

    addDartMatrixHit(coord: string) {
        const dartCode = dartCalibration[coord];
        console.log("got matrix hit:", dartCode, coord)
        const { score, ring } = parseDartCode(dartCode);
        this.addDartThrow(score, ring);
    }

}

const gameController = new GameController();

export default gameController;