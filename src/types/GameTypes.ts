import { getRingFromChar, Ring } from "./LedTypes";

export const isServer = typeof window === 'undefined';
export const isClient = !isServer;

export enum GameType {
	None = "",
	Game301 = "301",
	GameBaseball = "baseball",
	GameCricket = "cricket",
	GameGolf = "golf",
	GameHelicopter = "helicopter",
}

export interface GameBoardButtons {
	undo: boolean;
	miss: boolean;
	nextPlayer: boolean;
}

export interface Connections {
	dartboard: boolean;
	leds: boolean;
}

export interface GameStatus {
	currentGameType: GameType;
	currentGameName: string | null;
	players: string[];
	scores: number[];
	dartThrows: DartThrow[];
	currentRound: number;
	waitingForThrow: boolean;
	currentPlayerIndex: number;
	winningPlayerIndex: number;
	selectedSettings: SelectedSetting[] | null;
	finalScores: FinalScore[];
	calibrationState: CalibrationState | null;
	connections: Connections,
	buttons: GameBoardButtons,
}

export const resetGameStatus: Partial<GameStatus> = {
    currentGameType: GameType.None,
    currentGameName: null,
    players: [],
    scores: [],
    dartThrows: [],
    currentRound: 0,
    waitingForThrow: false,
    currentPlayerIndex: 0,
    winningPlayerIndex: -1,
    selectedSettings: [],
    finalScores: [],
};

export const startingGameStatus: GameStatus = {
    ...resetGameStatus,
    calibrationState: null,
    connections: {dartboard: false, leds: false},
	buttons: {undo: false, miss: false, nextPlayer: false},
} as GameStatus;

export interface GameDefinition {
	name: string;
	gameType: GameType,
	minPlayers: number;
	maxPlayers: number;
	pronounciation?: string;
	settingsIntro?: string;
	settingsOptions?: SettingOptions[];
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

export interface RoundScores {
	round: number;
	roundScores: number[];
}

export interface WinningScore {
	playerName: string;
	score: number;
	place: number;
}

export interface Scores {
	currentScores: number[];
	roundScores: RoundScores[];
	winningScores: WinningScore[];
}

export interface FinalScore {
	playerName: string;
	score: number;
	place: number;
}

export interface SettingOptions {
	name: string;
	propName: string;
	options: any[];
	displaySuffix?: string;
}
export interface SelectedSetting {
	settingName: string;
	settingValue: any;
}

export enum CalibrationMode {
    Dartboard,
    Leds,
}
export interface CalibrationState {
	mode: CalibrationMode;
	step: number | null;
}

export const parseDartCode = (code: string) => {
	const ring = getRingFromChar(code[0]);
	const score = parseInt(code.substring(1)) || 0;
	if (ring === Ring.Miss || score === 0)
		return { score: 0, ring: Ring.Miss }
	if (score === 25)
		return { ring: ring === Ring.InnerSingle ? Ring.OuterBullseye : Ring.DoubleBullseye, score: 25 };
	return { ring, score };
}

export const getSpokenScore = (dartCode: string) => {
	const { ring, score } = parseDartCode(dartCode);
	if (ring === Ring.Miss) return "Miss";
	if (ring === Ring.Triple) return "Triple " + score;
	const scoreStr = score === 25 ? "Bullseye" : "" + score;
	if (ring === Ring.Double || ring === Ring.DoubleBullseye) return "Double " + scoreStr;
	return scoreStr;
}

export enum Base {
	Miss = -2,
	OnDeck,
	AtBat,
	First,
	Second,
	Third,
	Home,
	Dugout,
}

export const getBaseName = (base: Base) => {
	if (base === Base.Home || base === Base.AtBat) return "home";
	if (base === Base.First) return "first";
	if (base === Base.Second) return "second";
	if (base === Base.Third) return "third";
	/*if (base === Base.Dugout)*/ return "dugout";
}