import GameType from "./GameBase";
import Game301 from "./Game301";
import GameHelicopter from "./GameHelicopter";
import GameBaseball from "./GameBaseball";
import GameCricket from "./GameCricket";
import GameGolf from "./GameGolf";
import GameBase from "./GameBase";


export const gameList: GameType[] = [];
const addGame = (game: GameBase) => gameList[game.gameDef.gameType] = game;
addGame(new Game301());
addGame(new GameHelicopter());
addGame(new GameBaseball());
addGame(new GameGolf());
addGame(new GameCricket());
