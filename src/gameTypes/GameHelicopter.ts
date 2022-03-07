import { cloneDeep, fill } from "lodash";
import ledManager, { scoreOrder } from "../LedManager";
import { speak } from "../store/AudioStore";
import { DartThrow, useGameStore } from "../store/GameStore";
import { Player } from "../store/PlayerStore";
import { Ring } from "../types/LedTypes";
import GameType, { FinalPlace } from "./GameType";


enum Difficulty {
	Easy = "Easy",
	Medium = "Medium",
	Hard = "Hard",
}

class GameHelicopter extends GameType {
	throwsPerRound = 3;
	numBlades = 4;
	difficulty = Difficulty.Easy;
	tickInterval?: NodeJS.Timer;
	
	settingsOptions = [
		{
			name: "Difficulty",
			propName: "difficulty",
			options: [ Difficulty.Easy, Difficulty.Medium, Difficulty.Hard ]
		},
	];

	constructor() {
		super({
			name: "Helicopter",
			minPlayers: 1,
			maxPlayers: 8,
		});
	}

	gameSelected() {
		ledManager.animQuadSpin();
	}

	setOptions() {
		super.setOptions();
		this.name = this.gameDef.name + " - " + this.difficulty;
	}

	getSpeed() {
		if (this.difficulty === Difficulty.Hard) return 10;
		if (this.difficulty === Difficulty.Medium) return 6;
		return 1;
	}

	getScore(player: Player): number {
		const { dartThrows, } = useGameStore.getState();

		const darts = dartThrows.filter(t => t.player === player.name);
		const score = darts.reduce((acc, dart) => acc + dart.totalScore, 0);

		return score;
	}

	waitingForThrowSet() {
		super.waitingForThrowSet();
		const { waitingForThrow } = useGameStore.getState(); 

		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = undefined;
		}

		if (waitingForThrow) {
			const speed = this.getSpeed();
			this.tickInterval = setInterval(this.tick, 1000 / speed);
			setTimeout(this.draw, 0);
			this.updateScores();
		}
	}

	paused = 0;
	addDartThrow(player: string, score: number, ring: Ring) {
		const { dartThrows, setDartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, finishGame, winningPlayerIndex } = useGameStore.getState();
		const currentPlayer = players[currentPlayerIndex];
		//console.log("addDartThrow", score, ring, player);
		
		ledManager.flashLed(score, ring);
		if (!players.length || winningPlayerIndex !== undefined) {
			return;
		}
		if (!waitingForThrow) {
			speak("remove darts and hit next player", true);
			return;
		}
		//this.paused = 2;

		const scoreIndex = scoreOrder.indexOf(score);
		const hitIndex = this.blades.indexOf(scoreIndex);
		const hit = hitIndex > -1;
		if (hit)
			this.blades[hitIndex] = undefined;
		
		const hitScore = hit ? 1 : 0;

		const clonedDarts = cloneDeep(dartThrows);
		const newThrow: DartThrow = {
			player,
			score,
			ring: hit ? ring : Ring.Miss,
			multiplier: hitScore,
			totalScore: hitScore,
			round: currentRound,
			bust: false,
			extra: hit ? hitIndex : undefined,
		}
		clonedDarts.push(newThrow);
		
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer.name);
		const playerScore = this.getScore(currentPlayer) + hitScore;
		console.log("playerscore will be", playerScore);

		const scoreMessage = hit ? "hit!" : "miss";
		speak(scoreMessage, true);

		if (playerScore === this.numBlades) {
			speak("Well done!. " + currentPlayer.name + " wins!");
			finishGame(currentPlayerIndex);
			ledManager.animSolidWipe();
		// Thrown 3 darts
		} else if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound)
			this.roundEnded();

		setDartThrows(clonedDarts);
		this.draw();
	}

	updateScores() {
		const { dartThrows, players, currentPlayerIndex } = useGameStore.getState();
		const currentPlayer = players[currentPlayerIndex];
		
		const bladesExist = fill(Array(this.numBlades), true);
		const playerDarts = dartThrows.filter(t => t.player === currentPlayer.name);
		playerDarts.forEach(dart => {
			if (dart.extra !== undefined)
				bladesExist[dart.extra] = false;
		})

		const offset = Math.floor(Math.random() * 20);
		const spacing = Math.floor(20 / this.numBlades);
		this.blades = bladesExist.map((exists, i) => exists ? (offset + i * spacing) % 20 : undefined);
		// console.log("updateScores() blades", currentPlayer, this.blades, playerDarts)
	}

	blades: (number | undefined)[] = [];

	tick = () => {
		console.log("tick");
		if (this.paused) return this.paused--;
		
		this.blades.forEach((blade, i) => {
			if (blade === undefined) return;
			this.blades[i] = (blade + 1) % 20;
		});

		this.draw();

		ledManager.dispatchUpdate();
	}

	draw = () => {
		ledManager.setAllOn(false, false); // Clear board
		
		this.blades.forEach((blade, i) => {
			if (blade === undefined) return;
			const score = scoreOrder[blade%20];
			ledManager.setScoreOn(score, true, false);
		});

		ledManager.dispatchUpdate();
	}

	playersSet() {
		super.playersSet();
	}

	getFinalScores(): FinalPlace[] {
		const { players, } = useGameStore.getState();
		const places: FinalPlace[] = players.map((player, i) => ({player, place: i, score: this.getScore(player) || 0})).sort((a, b) => b.score - a.score);
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

	cleanup(): void {
		super.cleanup();

		if (this.tickInterval)
			clearInterval(this.tickInterval);
	}

}

export default GameHelicopter;