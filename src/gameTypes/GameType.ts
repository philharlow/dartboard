import ledManager from "../LedManager";
import { speak } from "../store/AudioStore";
import { GameDefinition, useGameStore } from "../store/GameStore";
import { Player } from "../store/PlayerStore";
import { Ring } from "../types/LedTypes";


export interface SettingOptions {
	name: string;
	options: string[];
}
export interface SelectedSetting {
	name: string;
	option: string;
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

	chosen = () => {
		console.log("chosen() not implemented yet!")
		ledManager.doGrow();
	}

	setOptions = () => {
		console.log("setOptions() not implemented yet!")
	}

	playersSet = () => {
		const {
			players,
			currentPlayerIndex,
			setWaitingForThrow,
		} = useGameStore.getState();
		const currentPlayer = players[currentPlayerIndex];
		speak(players.length + " player" + (players.length > 1 ? "s" : ""));
		speak(currentPlayer.name + " is up first");
		ledManager.doWipe();
		setWaitingForThrow(true);
	}

	getScore = (player: Player) => {
		return 0;
	}

	update = () => {
		console.log("update() not implemented yet!")
	}

	addDartThrow = (player: string, score: number, ring: Ring) => {
		console.log("addDartThrow() not implemented yet!")
	}

	getSpokenScore = (score: number, ring: Ring) => {
		console.log("getSpokenScore() not implemented yet!")
	}
	
	geMultiplier = (ring: Ring): number => {
		console.log("geMultiplier() not implemented yet!")
		return 0;
	}
	
	undoLastDart = () => {
		const { dartThrows, setDartThrows, setWaitingForThrow } = useGameStore.getState();
		setDartThrows(dartThrows.slice(0, -1));
		setWaitingForThrow(true);
	}

	nextPlayer = () => {
		const { players, setWaitingForThrow, currentPlayerIndex, setCurrentPlayerIndex, currentRound, setCurrentRound } = useGameStore.getState();
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];

		// Next round
		if (nextPlayerIndex === 0)
			setCurrentRound(currentRound + 1);
		
		setWaitingForThrow(true);
		setCurrentPlayerIndex(nextPlayerIndex);
		speak("alright, " + nextPlayer.name + "'s turn!");
		this.update();
	}

	roundEnded = () => {
		const { players, setWaitingForThrow, currentPlayerIndex } = useGameStore.getState();
		const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
		const nextPlayer = players[nextPlayerIndex];
		speak("Grab darts. " + nextPlayer.name + " is up next");
		setWaitingForThrow(false);
		ledManager.doSolidWipe();
	}

}

export default GameType;