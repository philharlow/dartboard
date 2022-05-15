import { DartThrow, GameType } from "../../src/types/GameTypes";
import GameBase from "./gameBase";


class GameCricket extends GameBase {
	throwsPerRound = 3;

	constructor() {
		super({
			name: "Cricket",
			minPlayers: 1,
			maxPlayers: 8,
			gameType: GameType.GameCricket,
		});
	}
}

export default GameCricket;