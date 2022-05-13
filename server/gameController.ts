import { cloneDeep } from 'lodash';
import { DartThrow, GameStatus, GameType, parseDartCode, startingGameStatus, SelectedSetting, resetGameStatus } from '../src/types/GameTypes';
import { SocketEvent } from '../src/types/SocketTypes';
import GameBase from './gameTypes/gameBase';
import { gameList } from './gameTypes/gamesList';
import ledController from './ledController';
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
        console.log('setSettings:', settings);
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
        const { waitingForThrow } = this.gameStatus;
        //console.log("handling dart", score, ring);
        if (this.currentGame && waitingForThrow)
            this.currentGame.addDartThrow(score, ring);
        else if (ring !== Ring.Miss)
            ledController.flashLed(score, ring);
    }

    nextPlayer() {
        if (this.gameStatus.players.length)
            this.currentGame?.nextPlayer();
    }

    undoLastDart() {
        if (this.gameStatus.players.length)
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
        this.updateButtons(); // This should be done elsewhere
    }

    updateButtons() {
        // This needs cleanup, optimization, and generalization
		const { dartThrows, waitingForThrow, currentPlayerIndex, players, currentRound, currentGameType, buttons } = this.gameStatus;
		const isPlaying = currentGameType !== GameType.None && players.length;
		const currentPlayer = players[currentPlayerIndex];
		const playerDarts = dartThrows.filter(t => t.player === currentPlayer);
		const roundDarts = playerDarts.filter(t => t.round === currentRound);
		const undo = isPlaying && !(roundDarts.length === 0 && waitingForThrow);
		const miss = isPlaying && waitingForThrow;
		const nextPlayer = isPlaying && !waitingForThrow;

        if (buttons.miss !== miss || buttons.nextPlayer !== nextPlayer || buttons.undo !== undo) {
            this.updateGameStatus({ buttons: { undo, miss, nextPlayer } });
            ledController.updateButtons(this.gameStatus.buttons);
        }
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
        // console.log("got matrix hit:", dartCode, coord)
        const { score, ring } = parseDartCode(dartCode);
        this.addDartThrow(score, ring);
    }

}

const gameController = new GameController();

export default gameController;