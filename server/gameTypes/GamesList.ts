import GameType from "./GameBase";
import Game301 from "./Game301";
import GameHelicopter from "./GameHelicopter";
import GameBaseball from "./GameBaseball";
import GameCricket from "./GameCricket";
import GameGolf from "./GameGolf";
import GameBase from "./GameBase";


export const gameList: GameType[] = [
	new Game301(),
	new GameCricket(),
	new GameGolf(),
	new GameHelicopter(),
	new GameBaseball(),
];
