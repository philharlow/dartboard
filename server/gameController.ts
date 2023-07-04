import { cloneDeep } from 'lodash';
import { DartThrow, GameStatus, GameType, parseDartCode, startingGameStatus, SelectedSetting, resetGameStatus } from '../src/types/GameTypes';
import { GameEvent, SocketEvent } from '../src/types/SocketTypes';
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

    setGameType(gameType: GameType) {
        console.log('setGameType:', gameType);
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
        const gameDisplayName = this.currentGame?.getDisplayName(settings) ?? this.gameStatus.currentGameType;
        this.updateGameStatus({ selectedSettings: settings, currentGameName: gameDisplayName });
        this.currentGame?.optionsSet();
    }

    setPlayers(players: string[]) {
        console.log('setPlayers:', players);
        this.updateGameStatus({ players, waitingForThrow: true });
        this.currentGame?.playersSet();
        this.currentGame?.waitingForThrowSet();
    }

    addDartThrow(score: number, ring: Ring) {
        const { waitingForThrow } = this.gameStatus;
        // console.log("handling dart", score, ring, this.currentGame);
        if (this.currentGame && waitingForThrow) {
            this.currentGame.addDartThrow(score, ring);

            // TODO: do this in a better place
            if (score === 25) ledController.animBullseye();
        } else if (ring !== Ring.Miss)
            ledController.flashLed(score, ring);
    }

    isPlaying() {
        return this.gameStatus.players.length > 0;
    }

    nextPlayer() {
        if (this.isPlaying())
            this.currentGame?.nextPlayer();
    }

    undoLastDart() {
        if (this.isPlaying())
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
        socketServer.emit(GameEvent.UPDATE_GAME_STATUS, changes);
        this.updateButtons(); // This should be done elsewhere
    }

    updateButtons() {
        // This needs cleanup, optimization, and generalization
		const { dartThrows, waitingForThrow, currentPlayerIndex, players, currentRound, currentGameType, buttons } = this.gameStatus;
		const isPlaying = currentGameType !== GameType.None && this.isPlaying();
		const currentPlayer = players[currentPlayerIndex];
		const playerDarts = dartThrows.filter(t => t.player === currentPlayer);
		const roundDarts = playerDarts.filter(t => t.round === currentRound);
		const undo = isPlaying && dartThrows.length > 0; // !(roundDarts.length === 0 && waitingForThrow);
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