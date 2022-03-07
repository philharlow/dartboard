import GameType from "./GameType";


class GameCricket extends GameType {
	throwsPerRound = 3;

	constructor() {
		super({
			name: "Cricket",
			minPlayers: 1,
			maxPlayers: 8,
		});
	}
}

export default GameCricket;