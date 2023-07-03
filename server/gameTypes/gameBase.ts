import ledController from "../ledController";
//import { speak } from "../../src/store/AudioStore";
import { DartThrow, FinalScore, GameDefinition, SelectedSetting } from "../../src/types/GameTypes";
import { Ring } from "../../src/types/LedTypes";
import { delay, getRandom } from "../../src/tools/Utils";
import { playSound, showPopup, speak } from "../socketServer";
import gameController from "../gameController";
import { getPronounciation } from "../../src/types/PlayerTypes";
import { SoundFX } from "../../src/types/SocketTypes";


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
		const spokenName = this.gameDef.pronounciation || this.gameDef.name;
		const intro = this.gameDef.settingsIntro ?? "Select your settings";
		speak(spokenName); // + "., " + intro); // extra comma causes better pause 🤷‍♂️
		this.startingAnim();
	}

	getDisplayName(settings?: SelectedSetting[]) {
		const suffix = settings?.map(setting => {
			const option = this.getOption(setting.settingName);
			return setting.settingValue + " " + (option?.displaySuffix ?? option?.name);
		}).join(", ");
		return this.gameDef.name + (suffix ? ", " + suffix : "");
	}

	startingAnim() {
		ledController.animGrow();
	}

	exiting() {
		console.log(this.gameDef.name + " : exitting");
		ledController.animShrink();
	}

	getOption(optionName: string) {
		const option = this.gameDef.settingsOptions.find(op => op.name === optionName);
		return option;
	}

	optionsSet() {
		const { selectedSettings } = gameController.gameStatus;

		selectedSettings?.forEach(setting => {
			const option = this.getOption(setting.settingName);
			// Apply settings via propName
			if (option)
				(this as any)[option.propName] = setting.settingValue;
		})

		if (selectedSettings.length)
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
	
	getMultiplier(ring: Ring) {
		if (ring === Ring.Triple) return 3;
		if (ring === Ring.Double || ring === Ring.DoubleBullseye) return 2;
		return 1;
	}

	currentScores: number[] = [];
	roundScores: number[][] = [];
	currentPlayerRoundScores: number[] = [];
	currentPlayerRoundDarts: DartThrow[] = [];
	
	updateScores() {
		const { players, dartThrows } = gameController.gameStatus
		const newScores = players.map(player => this.getScore(player, dartThrows));
		gameController.updateGameStatus({ scores: newScores });
	}

	waitingForThrowSet() {
		
	}

	updateHints() {
	}
	waitingForDart() {
		return gameController.gameStatus.waitingForThrow;
	}

	getDartThrow(score: number, ring: Ring): DartThrow | undefined {
		// Check if we are waiting for a dart

		// Build the dart throw
		const dartThrow: DartThrow | undefined = undefined;
		return dartThrow;
	}

	addDartThrow(score: number, ring: Ring) {
		// Create DartThrow
		const dartThrow = this.getDartThrow(score, ring);
		// Handle DartThrow
		if (dartThrow) {
			// Add DartThrow to game status

			// Update dartsByRound

			// Update scores/winners

			// Update current player and round if needed

			// Update hints

			// Update visual/sound fx (ie. bullseye anim/sound)

			// If new winners, show popup

			// Else
			
			// Speak message for dart throw

			// Dispatch popup

		}
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
		if (lastDart) { // && lastDart.player === currentPlayer && lastDart.round === currentRound) {
			gameController.updateGameStatus({
				dartThrows: dartThrows.slice(0, -1),
				waitingForThrow: true,
				winningPlayerIndex: -1,
				currentRound: lastDart.round,
				currentPlayerIndex: players.indexOf(lastDart.player),
			})
			this.waitingForThrowSet();
			this.updateHints();
			this.updateScores();

			// Announce a player change
			//if (currentPlayer !== lastDart.player)
			//	speak("It's " + lastDart.player + "'s throw");
			speak("Undone. It's " + lastDart.player + "'s throw", true);
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

		// Random prompt
		const prefix = getRandom(["alright", "ok"]);
		const suffix = getRandom(["'s turn!", " is up!"]);
		const text = prefix + " " + nextPlayer + suffix;
		speak(text);
		
		showPopup(nextPlayer + " " + suffix);
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