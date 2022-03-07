import GameType from "./GameType";


class GameGolf extends GameType {
	throwsPerRound = 3;

	constructor() {
		super({
			name: "Golf",
			minPlayers: 1,
			maxPlayers: 8,
		});
	}
}

export default GameGolf;