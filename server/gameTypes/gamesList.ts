import GameType from "./gameBase";
import Game301 from "./game301";
import GameHelicopter from "./gameHelicopter";
import GameBaseball from "./gameBaseball";
import GameCricket from "./gameCricket";
import GameGolf from "./gameGolf";


export const gameList: GameType[] = [
	new Game301(),
	//new GameCricket(),
	new GameGolf(),
	new GameHelicopter(),
	new GameBaseball(),
];
