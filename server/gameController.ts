import { cloneDeep } from 'lodash';
import { DartThrow, GameStatus, GameType, SelectedSetting } from '../src/types/GameTypes';
import { Ring } from '../src/types/ledTypes';
import { Player } from '../src/types/PlayerTypes';
import { SocketEvent } from '../src/types/SocketTypes';
import GameBase from './gameTypes/GameBase';
import { gameList } from './gameTypes/GamesList';
import ledController from './ledController';
import { socketServer } from './sockerServer';

console.log("gameController init")

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
};

class GameController {
    currentGame?: GameBase;
    
    gameStatus: GameStatus = cloneDeep(resetGameStatus);

    startGame(gameType: GameType) {
        console.log('startGame:', gameType);
        if (this.currentGame) {
            this.currentGame.exiting();
            this.reset();
        }
        this.currentGame = gameList.find(game => game.gameDef.gameType === gameType);
        this.currentGame?.starting();
        const currentGameIndex = gameList.findIndex(game => game.gameDef.gameType === gameType);
        this.updateGameStatus({ currentGameType: currentGameIndex });
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
    }

    addDartThrow(score: number, ring: Ring) {
        console.log("handling dart", score, ring);
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
    }
    

    updateGameStatus(changes: Partial<GameStatus>) {
        Object.assign(this.gameStatus, changes);
        socketServer.emit(SocketEvent.UPDATE_GAME_STATUS, changes);
    }

}

const gameController = new GameController();

export default gameController;