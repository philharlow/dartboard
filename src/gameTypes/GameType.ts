import ledManager from "../LedManager";
import { speak } from "../store/AudioStore";
import { GameDefinition, useGameStore } from "../store/GameStore";
import { Player } from "../store/PlayerStore";
import { Ring } from "../types/LedTypes";

export interface FinalPlace {
	player: Player;
	score: number;
	place: number;
}

export interface SettingOptions {
	name: string;
	propName: string;
	options: any[];
}
export interface SelectedSetting {
	name: string;
	option: any;
}

class GameType {
	name: string;
	gameDef: GameDefinition;
	settingsOptions: SettingOptions[] = [];

	constructor(
		gameDef: GameDefinition)
	{
		this.gameDef = gameDef;
		this.name = this.gameDef.name;
	}

	gameSelected() {
		console.log("gameSelected() not implemented yet!")
		ledManager.animGrow();
	}

	setOptions() {
		const { selectedSettings, } = useGameStore.getState();

		selectedSettings?.forEach(setting => {
			const options = this.settingsOptions.find(op => op.name === setting.name);
			// Apply settings via propName
			if (options)
				(this as any)[options.propName] = setting.option;
		})
	}

	playersSet() {
		const {
			players,
			currentPlayerIndex,
			setWaitingForThrow,
		} = useGameStore.getState();
		const currentPlayer = players[currentPlayerIndex];
		speak(players.length + " player" + (players.length > 1 ? "s" : ""));
		speak(currentPlayer.name + " is up first");
		setWaitingForThrow(true);
	}

	waitingForThrowSet() {
		
	}

	getScore(player: Player) {
		return 0;
	}

	updateHints() {
	}

	addDartThrow(player: string, score: number, ring: Ring) {
		console.log("addDartThrow() not implemented yet!")
	}

	getSpokenScore(score: number, ring: Ring) {
		console.log("getSpokenScore() not implemented yet!")
	}
	
	geMultiplier(ring: Ring): number {
		console.log("geMultiplier() not implemented yet!")
		return 0;
	}
	
	undoLastDart() {
		const { dartThrows, setDartThrows, setWaitingForThrow, setWinningPlayerIndex } = useGameStore.getState();
		setDartThrows(dartThrows.slice(0, -1));
		setWaitingForThrow(true);
		setWinningPlayerIndex(undefined);
		speak("Undone", true);
		this.updateHints();
	}

	nextPlayer() {
		const { players, setWaitingForThrow, currentPlayerIndex, setCurrentPlayerIndex, currentRound, setCurrentRound } = useGameStore.getState();
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];

		// Next round
		if (nextPlayerIndex === 0)
			setCurrentRound(currentRound + 1);
		
		setCurrentPlayerIndex(nextPlayerIndex);
		setWaitingForThrow(true);
		speak("alright, " + nextPlayer.name + "'s turn!");
		this.updateHints();
	}

	roundEnded() {
		const { players, setWaitingForThrow, currentPlayerIndex } = useGameStore.getState();
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];
		speak("Grab darts. " + nextPlayer.name + " is up next");
		setWaitingForThrow(false);
		ledManager.setHints([]);
		ledManager.animSolidWipe();
	}

	getFinalScores() : FinalPlace[] {
		const { players, } = useGameStore.getState();
		const places: FinalPlace[] = players.map((player, i) => ({player, place: i, score: this.getScore(player) || 0})).sort((a, b) => a.score - b.score);
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

	cleanup() {
		ledManager.animShrink();
	}

}

export default GameType;