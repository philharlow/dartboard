import create from 'zustand'
import Game301 from '../gameTypes/Game301';
import GameType, { SelectedSetting } from '../gameTypes/GameType';
import { Ring } from '../types/LedTypes';
import { Player } from './PlayerStore';

export interface PlayerScores {
	name: string;
	minPlayers: number;
	maxPlayers: number;
	pronounciation: string;
	update: () => void;
}

export interface GameDefinition {
	name: string;
	minPlayers: number;
	maxPlayers: number;
	pronounciation?: string;
}

export const gameList: GameType[] = [
	new Game301(),
	new GameType({name: "Cricket", minPlayers: 1, maxPlayers: 8}),
	new GameType({name: "Cutthroat Cricket", minPlayers: 1, maxPlayers: 8}),
	new GameType({name: "Baseball", minPlayers: 1, maxPlayers: 8}),
	new GameType({name: "Golf", minPlayers: 1, maxPlayers: 8}),
];

export interface DartThrow {
	player: string;
	score: number;
	multiplier: number;
	totalScore: number;
	ring: Ring;
	round: number;
	bust: boolean;
}

export type GameStore = {
	currentGame?: GameType;
	players: Player[];
	dartThrows: DartThrow[];
	currentRound: number;
	waitingForThrow: boolean;
	currentPlayerIndex: number;
	winningPlayerIndex?: number;
	serialConnected: boolean;
	selectedSettings?: SelectedSetting[];
	setDartThrows: (dartThrows: DartThrow[]) => void;
	setCurrentRound: (round: number) => void;
	setWaitingForThrow: (waitingForThrow: boolean) => void;
	setPlayers: (players: Player[]) => void;
	startGame: (gameType?: GameType) => void;
	setCurrentPlayerIndex: (currentPlayerIndex: number) => void;
	finishGame: (winningPlayerIndex: number) => void;
	setSerialConnected: (connected: boolean) => void;
	setSelectedSettings: (selectedSettings?: SelectedSetting[]) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
	players: [],
	dartThrows: [],
	currentRound: 0,
	waitingForThrow: false,
	currentPlayerIndex: 0,
	serialConnected: false,
	setWaitingForThrow: (waitingForThrow: boolean) => {
		set({ waitingForThrow });
	},
	setDartThrows: (dartThrows: DartThrow[]) => {
		set({ dartThrows });
	},
	setCurrentRound: (currentRound: number) => {
		set({ currentRound });
	},
	setPlayers: (players: Player[]) => {
		const { currentGame } = get();
		set({ players });
		currentGame?.playersSet();
	},
	startGame: (game?: GameType) => {
		set({ currentGame: game,
			players: [],
			dartThrows: [],
			currentPlayerIndex: 0,
			winningPlayerIndex: 0,
			selectedSettings: undefined,
		});
		game?.chosen();
	},
	setCurrentPlayerIndex: (currentPlayerIndex: number) => {
		set({ currentPlayerIndex });
	},
	finishGame: (winningPlayerIndex: number) => {
		set({ winningPlayerIndex, waitingForThrow: false });
	},
	setSerialConnected: (serialConnected: boolean) => {
		set({ serialConnected });
	},
	setSelectedSettings: (selectedSettings?: SelectedSetting[]) => {
		set({ selectedSettings });
		const { currentGame } = get();
		currentGame?.setOptions();
	},
  }));