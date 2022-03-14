import { DartThrow, GameType } from "../../src/types/GameTypes";
import GameBase from "./GameBase";


class GameGolf extends GameBase {
	throwsPerRound = 3;

	constructor() {
		super({
			name: "Golf",
			minPlayers: 1,
			maxPlayers: 8,
			gameType: GameType.GameGolf,
		});
	}
}

export default GameGolf;