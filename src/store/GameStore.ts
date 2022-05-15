import create from 'zustand'
import { emit, socket } from '../SocketInterface';
import { serverFetch } from '../tools/ClientUtils';
import { DartThrow, GameDefinition, GameStatus, GameType, SelectedSetting, startingGameStatus } from '../types/GameTypes';
import { SocketEvent } from '../types/SocketTypes';

export type GameStore = GameStatus & {
	gameList?: GameDefinition[];
	selectGame: (gameType?: GameType) => void;
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
	socket?.emit(SocketEvent.UPDATE_GAME_STATUS, change);
};

export const useGameStore = create<GameStore>((set, get) => ({
	...startingGameStatus,
	selectGame: (game?: GameType) => {
		emit(SocketEvent.START_GAME, game);
	},
	setWaitingForThrow: (waitingForThrow: boolean) => {
		emit(SocketEvent.SET_WAITING_FOR_THROW, waitingForThrow);
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
		emit(SocketEvent.SET_SETTINGS, selectedSettings);
	},
	setPlayers: (players: string[]) => {
		emit(SocketEvent.SET_PLAYERS, players);
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