import create from 'zustand'
import { emit, socket } from '../SocketInterface';
import { DartThrow, GameDefinition, GameStatus, GameType, SelectedSetting } from '../types/GameTypes';
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
	currentGameType: GameType.None,
	players: [],
	scores: [],
	dartThrows: [],
	currentRound: 0,
	waitingForThrow: false,
	currentPlayerIndex: 0,
	winningPlayerIndex: -1,
	selectGame: (game?: GameType) => {
		//currentGame?.cleanup();
		emit(SocketEvent.START_GAME, game);
	},
	setWaitingForThrow: (waitingForThrow: boolean) => {
		setViaSocket({ waitingForThrow });
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
		//currentGame?.setOptions();
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
		const resp = await fetch(document.location.protocol + '//' + document.location.hostname + ":4000/gameList");
		const gameList = await resp.json();
		if (gameList)
			set({ gameList });
		console.log("got gameList", gameList);
	},
  }));