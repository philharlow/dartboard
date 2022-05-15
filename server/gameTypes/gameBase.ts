import ledController from "../ledController";
//import { speak } from "../../src/store/AudioStore";
import { DartThrow, FinalScore, GameDefinition } from "../../src/types/GameTypes";
import { Ring } from "../../src/types/LedTypes";
import { delay } from "../../src/tools/Utils";
import { playSound, showPopup, speak } from "../socketServer";
import gameController from "../gameController";
import { getPronounciation } from "../../src/types/PlayerTypes";
import { SoundFX } from "../../src/types/SocketTypes";



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
		speak((this.gameDef.pronounciation || this.gameDef.name) + ". " + (this.gameDef.settingsIntro ?? "Select your settings"));
		this.startingAnim();
	}

	startingAnim() {
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
		speak("Select Players");
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
		const { players, } = gameController.gameStatus;
		
		gameController.updateGameStatus({ winningPlayerIndex, finalScores: this.getFinalScores(), waitingForThrow: false });
		playSound(SoundFX.CHEERING);
		speak("Well done!. " + players[winningPlayerIndex] + " wins!");
		ledController.animSolidWipe();
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

	getSpokenScore(score: number, ring: Ring): string {
		console.log("getSpokenScore() not implemented yet!");
		return "";
	}
	
	undoLastDart() {
		const { dartThrows, currentPlayerIndex, players, currentRound } = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		// TODO protect undoing more than current round's darts
		const lastDart = dartThrows[dartThrows.length - 1];
		if (lastDart && lastDart.player === currentPlayer && lastDart.round === currentRound) {
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
	}
	
	hasPlayerWon(playerIndex: number): boolean {
		return false;
	}

	nextPlayer() {
		const { players,  currentPlayerIndex,  currentRound } = gameController.gameStatus;
		let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		for (let i=0; i< players.length; i++) {
			if (this.hasPlayerWon(nextPlayerIndex))
				nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
		}
		const nextPlayer = players[nextPlayerIndex];
		

		// Next round
		if (nextPlayerIndex <= currentPlayerIndex )
			gameController.updateGameStatus({ currentRound: currentRound + 1 });
		
		gameController.updateGameStatus({
			currentPlayerIndex: nextPlayerIndex,
			waitingForThrow: true,
		});
		this.waitingForThrowSet();
		if (Math.random() > 0.5) speak("alright, " + nextPlayer + "'s turn!");
		else speak("ok, " + nextPlayer + " is up!");
		
		showPopup(nextPlayer + " is up");
		this.updateHints();
	}

	roundEnded() {
		const { players, currentPlayerIndex } = gameController.gameStatus;
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];
		speak("Grab darts and hit next player. "); // + getPronounciation(gameController.allPlayers , nextPlayer) + " is up next");
		gameController.updateGameStatus({ waitingForThrow: false });
		ledController.setHints([]);
		this.roundEndedAnim();
	}

	async roundEndedAnim() {
		await delay(500);
		ledController.animSolidWipe();
	}

	getFinalScores() : FinalScore[] {
		const { players, dartThrows } = gameController.gameStatus;
		const places: FinalScore[] = players.map((player, i) => ({
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