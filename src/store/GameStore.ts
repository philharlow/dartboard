import create from 'zustand'
import GameType, { SelectedSetting } from '../gameTypes/GameType';
import { Ring } from '../types/LedTypes';
import { Player } from './PlayerStore';

export interface GameDefinition {
	name: string;
	minPlayers: number;
	maxPlayers: number;
	pronounciation?: string;
}

export interface DartThrow {
	player: string;
	score: number;
	multiplier: number;
	totalScore: number;
	ring: Ring;
	round: number;
	bust: boolean;
	extra?: number;
}

export type GameStore = {
	currentGame?: GameType;
	players: Player[];
	dartThrows: DartThrow[];
	currentRound: number;
	waitingForThrow: boolean;
	currentPlayerIndex: number;
	winningPlayerIndex?: number;
	selectedSettings?: SelectedSetting[];
	setDartThrows: (dartThrows: DartThrow[]) => void;
	setCurrentRound: (round: number) => void;
	setWaitingForThrow: (waitingForThrow: boolean) => void;
	setPlayers: (players: Player[]) => void;
	selectGame: (gameType?: GameType) => void;
	setCurrentPlayerIndex: (currentPlayerIndex: number) => void;
	finishGame: (winningPlayerIndex: number) => void;
	setWinningPlayerIndex: (winningPlayerIndex?: number) => void;
	setSelectedSettings: (selectedSettings?: SelectedSetting[]) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
	players: [],
	dartThrows: [],
	currentRound: 0,
	waitingForThrow: false,
	currentPlayerIndex: 0,
	setWaitingForThrow: (waitingForThrow: boolean) => {
		const { currentGame } = get();
		set({ waitingForThrow });
		currentGame?.waitingForThrowSet();
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
	selectGame: (game?: GameType) => {
		const { currentGame } = get();
		currentGame?.cleanup();
		set({ currentGame: game,
			players: [],
			dartThrows: [],
			currentPlayerIndex: 0,
			currentRound: 0,
			winningPlayerIndex: undefined,
			selectedSettings: undefined,
		});
		game?.gameSelected();
	},
	setCurrentPlayerIndex: (currentPlayerIndex: number) => {
		set({ currentPlayerIndex });
	},
	finishGame: (winningPlayerIndex: number) => {
		set({ winningPlayerIndex, waitingForThrow: false });
	},
	setWinningPlayerIndex: (winningPlayerIndex?: number) => {
		set({ winningPlayerIndex });
	},
	setSelectedSettings: (selectedSettings?: SelectedSetting[]) => {
		set({ selectedSettings });
		const { currentGame } = get();
		currentGame?.setOptions();
	},
  }));