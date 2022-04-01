import { getRingFromChar, Ring } from "./LedTypes";

export enum GameType {
	None = "",
	Game301 = "301",
	GameBaseball = "baseball",
	GameCricket = "cricket",
	GameGolf = "golf",
	GameHelicopter = "helicopter",
}


export interface GameStatus {
	currentGameType: GameType;
	currentGameName?: string;
	players: string[];
	scores: number[];
	dartThrows: DartThrow[];
	currentRound: number;
	waitingForThrow: boolean;
	currentPlayerIndex: number;
	winningPlayerIndex: number;
	selectedSettings?: SelectedSetting[];
	calibrated: boolean[];
}

export interface GameDefinition {
	name: string;
	gameType: GameType,
	minPlayers: number;
	maxPlayers: number;
	pronounciation?: string;
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

export interface FinalPlace {
	playerName: string;
	score: number;
	place: number;
}

export interface SettingOptions {
	name: string;
	propName: string;
	options: any[];
}
export interface SelectedSetting {
	name: string;
	option: any;
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