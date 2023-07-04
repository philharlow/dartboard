import create from 'zustand'
import { emit, socket } from '../SocketInterface';
import { serverFetch } from '../tools/ClientUtils';
import { DartThrow, GameDefinition, GameStatus, GameType, SelectedSetting, startingGameStatus } from '../types/GameTypes';
import { GameEvent } from '../types/SocketTypes';

export type GameStore = GameStatus & {
	gameList?: GameDefinition[];
	setGameType: (gameType?: GameType) => void;
	setDartThrows: (dartThrows: DartThrow[]) => void;
	setCurrentRound: (round: number) => void;
	setWaitingForThrow: (waitingForThrow: boolean) => void;
	setPlayers: (players: string[]) => void;
	setCurrentPlayerIndex: (currentPlayerIndex: number) => void;
	finishGame: (winningPlayerIndex: number) => void;
	setWinningPlayerIndex: (winningPlayerIndex: number) => void;
	setSelectedSettings: (selectedSettings: SelectedSetting[]) => void;
	fetchGameList: () => void;
};

const setViaSocket = (change: Partial<GameStore>) => {
	socket?.emit(GameEvent.UPDATE_GAME_STATUS, change);
};

export const useGameStore = create<GameStore>((set, get) => ({
	...startingGameStatus,
	setGameType: (game?: GameType) => {
		emit(GameEvent.START_GAME, game);
	},
	setWaitingForThrow: (waitingForThrow: boolean) => {
		emit(GameEvent.SET_WAITING_FOR_THROW, waitingForThrow);
		//setViaSocket({ waitingForThrow });
		//currentGame?.waitingForThrowSet();
	},
	setDartThrows: (dartThrows: DartThrow[]) => {
		setViaSocket({ dartThrows });
	},
	setCurrentRound: (currentRound: number) => {
		setViaSocket({ currentRound });
	},
	setSelectedSettings: (selectedSettings: SelectedSetting[]) => {
		emit(GameEvent.SET_SETTINGS, selectedSettings);
	},
	setPlayers: (players: string[]) => {
		emit(GameEvent.SET_PLAYERS, players);
		//currentGame?.playersSet();
	},
	setCurrentPlayerIndex: (currentPlayerIndex: number) => {
		setViaSocket({ currentPlayerIndex });
	},
	finishGame: (winningPlayerIndex: number) => {
		setViaSocket({ winningPlayerIndex, waitingForThrow: false });
	},
	setWinningPlayerIndex: (winningPlayerIndex: number) => {
		setViaSocket({ winningPlayerIndex });
	},
	
	fetchGameList: async () => {
		set({ gameList: [] });
		const gameList = await serverFetch("gameList");
		if (gameList)
			set({ gameList });
		console.log("got gameList", gameList);
	},
  }));