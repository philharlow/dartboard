import ledController from "../LedController";
//import { speak } from "../../src/store/AudioStore";
import { DartThrow, FinalPlace, GameDefinition } from "../../src/types/GameTypes";
import { Ring } from "../../src/types/LedTypes";
import { delay } from "../../src/tools/Utils";
import { speak } from "../sockerServer";
import gameController from "../gameController";



export const addDartThrow = (score: number, ring: Ring) => {
	const { currentGame } = gameController;
	if (currentGame) {
		//currentGame?.addDartThrow(score, ring);
	} else {
		ledController.flashLed(score, ring);
	}
}

class GameBase {
	gameDef: GameDefinition;
	throwsPerRound = 3;

	constructor(
		gameDef: GameDefinition)
	{
		this.gameDef = gameDef;
	}

	starting() {
		console.log(this.gameDef.name + " : starting");
		ledController.animGrow();
	}

	exiting() {
		console.log(this.gameDef.name + " : exitting");
		ledController.animShrink();
	}

	setOptions() {
		const { selectedSettings, } = gameController.gameStatus;

		selectedSettings?.forEach(setting => {
			const options = this.gameDef.settingsOptions.find(op => op.name === setting.name);
			// Apply settings via propName
			if (options)
				(this as any)[options.propName] = setting.option;
		})
	}

	playersSet() {
		const {
			players,
			currentPlayerIndex,
		} = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		speak(players.length + " player" + (players.length > 1 ? "s" : ""));
		speak(currentPlayer + " is up first");
		this.updateScores();
		this.updateHints();
	}

	finishGame(winningPlayerIndex: number) {
		
		gameController.updateGameStatus({ winningPlayerIndex, waitingForThrow: false });
	}

	getScore(player: string, dartThrows: DartThrow[]) {
		return 0;
	}

	updateScores() {
		const { players, dartThrows } = gameController.gameStatus
		const newScores = players.map(player => this.getScore(player, dartThrows));
		gameController.updateGameStatus({ scores: newScores });
	}

	waitingForThrowSet() {
		
	}

	updateHints() {
	}

	addDartThrow(score: number, ring: Ring) {
		console.log("addDartThrow() not implemented yet!")
	}

	getSpokenScore(score: number, ring: Ring) {
		console.log("getSpokenScore() not implemented yet!")
	}
	
	getMultiplier(ring: Ring) {
		if (ring === Ring.Triple) return 3;
		if (ring === Ring.Double || ring === Ring.DoubleBullseye) return 2;
		return 1;
	}
	
	undoLastDart() {
		const { dartThrows } = gameController.gameStatus;
		gameController.updateGameStatus({
			dartThrows: dartThrows.slice(0, -1),
			waitingForThrow: true,
			winningPlayerIndex: -1,
		})
		this.waitingForThrowSet();
		speak("Undone", true);
		this.updateHints();
		this.updateScores();
	}

	nextPlayer() {
		const { players,  currentPlayerIndex,  currentRound, } = gameController.gameStatus;
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];
		

		// Next round
		if (nextPlayerIndex === 0)
			gameController.updateGameStatus({ currentRound: currentRound + 1 });
		
		gameController.updateGameStatus({
			currentPlayerIndex: nextPlayerIndex,
			waitingForThrow: true,
		});
		this.waitingForThrowSet();
		speak("alright, " + nextPlayer + "'s turn!");
		this.updateHints();
	}

	roundEnded() {
		const { players, currentPlayerIndex } = gameController.gameStatus;
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];
		speak("Grab darts. " + nextPlayer + " is up next");
		gameController.updateGameStatus({ waitingForThrow: false });
		ledController.setHints([]);
		this.roundEndedAnim();
	}

	async roundEndedAnim() {
		await delay(500);
		ledController.animSolidWipe();
	}

	getFinalScores() : FinalPlace[] {
		const { players, dartThrows } = gameController.gameStatus;
		const places: FinalPlace[] = players.map((player, i) => ({
			playerName: player,
			place: i,
			score: this.getScore(player, dartThrows) || 0
		})).sort((a, b) => a.score - b.score);

		let lastScore = places[0].score;
		let currentPlace = 1;
		places.forEach(playerScore => {
			if (playerScore.score > lastScore) {
				lastScore = playerScore.score;
				currentPlace++;
			}
			playerScore.place = currentPlace;
		});
		return places;
	}

}

export default GameBase;