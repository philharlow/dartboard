import { cloneDeep } from "lodash";
import ledManager from "../LedManager";
import { speak } from "../store/AudioStore";
import { DartThrow, useGameStore } from "../store/GameStore";
import { Ring } from "../types/LedTypes";
import GameType from "./GameType";

const baseballField = [ 9, 12, 5, 20, 1, 18, 4 ];

export enum Base {
	Home,
	First,
	Second,
	Third,
	Dugout,
}

export const getBaseName = (base: Base) => {
	if (base === Base.Home) return "home";
	if (base === Base.First) return "first";
	if (base === Base.Second) return "second";
	if (base === Base.Third) return "third";
	if (base === Base.Dugout) return "dugout";
}

export const baseList = [Base.Home, Base.First, Base.Second, Base.Third, Base.Home];
export const runnerOrder = [Base.Dugout, Base.Home, Base.First, Base.Second, Base.Third, Base.Home, Base.Dugout];

class GameBaseball extends GameType {
	throwsPerRound = 3;

	constructor() {
		super({
			name: "Baseball",
			minPlayers: 1,
			maxPlayers: 8,
		});
	}

	addDartThrow(score: number, ring: Ring) {
		const { dartThrows, setDartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, winningPlayerIndex } = useGameStore.getState();
		const currentPlayer = players[currentPlayerIndex];
		console.log("addDartThrow", score, ring, currentPlayer);
		
		ledManager.flashLed(score, ring);
		if (!players.length || winningPlayerIndex !== undefined) {
			return;
		}
		if (!waitingForThrow) {
			speak("remove darts and hit next player", true);
			return;
		}

		let hit = baseballField.includes(score);

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = this.getMultiplier(ring);
		const newThrow: DartThrow = {
			player: currentPlayer.name,
			score,
			ring,
			multiplier,
			totalScore: hit ? multiplier : 0,
			round: currentRound,
			bust: false,
		}
		clonedDarts.push(newThrow);
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer.name);
		
		
		// Homerun
		const lastThrow = false;// TODO
		if (score === 25 && lastThrow)
			hit = true;

		const playerScore = this.getScore(currentPlayer) + multiplier;
		console.log("playerscore will be", playerScore);

		const scoreMessage = hit ? this.getSpokenScore(score, ring) : "miss";
		speak(scoreMessage, true);
		
		/*if (playerScore === 0) {
			speak("Well done!. " + currentPlayer.name + " wins!");
			finishGame(currentPlayerIndex);
			ledManager.animSolidWipe();
		// Thrown 3 darts
		} else */
		if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound)
			this.roundEnded();


		setDartThrows(clonedDarts);
		this.updateHints();
	}
	getSpokenScore(score: number, ring: Ring) {
		if (ring === Ring.InnerBullseye || ring === Ring.OuterBullseye) return "homerun";
		if (ring === Ring.Triple) return "triple";
		if (ring === Ring.Double) return "double";
		return "single";
	}
	
	getMultiplier(ring: Ring) {
		if (ring === Ring.Triple) return 3;
		if (ring === Ring.Double) return 2;
		return 1;
	}
}

export default GameBaseball;