import GameType from "./GameType";

const baseballField = [ 9, 12, 5, 20, 1, 18, 4 ];

class GameBaseball extends GameType {
	throwsPerRound = 3;

	constructor() {
		super({
			name: "Baseball",
			minPlayers: 1,
			maxPlayers: 8,
		});
	}
}

export default GameBaseball;