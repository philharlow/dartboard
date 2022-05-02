import { cloneDeep, fill } from "lodash";
import ledController from "../LedController";
//import { speak } from "../../src/store/AudioStore";
import { DartThrow, FinalScore, GameType } from "../../src/types/GameTypes";
import { Ring, scoreOrder } from "../../src/types/LedTypes";
import { Player } from "../../src/types/PlayerTypes";
import GameBase from "./GameBase";
import { socketServer, speak } from "../socketServer";
import gameController from "../gameController";
import { SocketEvent } from "../../src/types/SocketTypes";


enum Difficulty {
	Easy = "Easy",
	Medium = "Medium",
	Hard = "Hard",
}

class GameHelicopter extends GameBase {
	throwsPerRound = 3;
	numBlades = 4;
	difficulty = Difficulty.Easy;
	tickInterval?: NodeJS.Timer;
	

	constructor() {
		super({
			name: "Helicopter",
			minPlayers: 1,
			maxPlayers: 8,
			gameType: GameType.GameHelicopter,
			settingsOptions: [
				{
					name: "Difficulty",
					propName: "difficulty",
					options: [ Difficulty.Easy, Difficulty.Medium, Difficulty.Hard ]
				},
			],
		});
	}

	getScore(player: string, dartThrows: DartThrow[]) {
		const darts = dartThrows.filter(t => t.player === player);
		const score = darts.reduce((acc, dart) => acc + dart.totalScore, 0);

		return score;
	}

	hasPlayerWon(playerIndex: number): boolean {
		const { scores } = gameController.gameStatus;
		if (scores[playerIndex] === 4) return true;
		return false;
	}

	startingAnim() {
		ledController.animQuadSpin();
	}

	exiting() {
		super.exiting();

		this.clearTick();
	}

	setOptions() {
		super.setOptions();
		gameController.updateGameStatus({ currentGameName: this.gameDef.name + " - " + this.difficulty });
	}

	getSpeed() {
		if (this.difficulty === Difficulty.Hard) return 2;
		if (this.difficulty === Difficulty.Medium) return 1.5;
		return 1;
	}

	waitingForThrowSet() {
		super.waitingForThrowSet();
		
		const { dartThrows, players, currentPlayerIndex } = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		
		const bladesExist = fill(Array(this.numBlades), true);
		const playerDarts = dartThrows.filter(t => t.player === currentPlayer);
		playerDarts.forEach(dart => {
			if (dart.extra !== undefined)
				bladesExist[dart.extra] = false;
		})

		const offset = Math.floor(Math.random() * 20);
		const spacing = Math.floor(20 / this.numBlades);
		this.blades = bladesExist.map((exists, i) => exists ? (offset + i * spacing) % 20 : undefined);
		//console.log("waitingForThrowSet() blades", currentPlayer, this.blades, playerDarts)

		this.updateTick();
	}

	updateTick() {
		const { waitingForThrow } = gameController.gameStatus;
		
		if (this.tickInterval) {
			return;
		}

		if (waitingForThrow) {
			const speed = this.getSpeed();
			this.tickInterval = setInterval(this.tick, 1000 / speed);
			setTimeout(this.draw, 0);
			this.updateScores();
		}
	}

	paused = 0;
	addDartThrow(score: number, ring: Ring) {
		const { dartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, winningPlayerIndex } = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		//console.log("addDartThrow", score, ring, player);
		
		ledController.flashLed(score, ring);
		if (!players.length || winningPlayerIndex > -1) {
			return;
		}
		if (!waitingForThrow && ring !== Ring.Miss) {
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
			player: currentPlayer,
			score,
			ring: hit ? ring : Ring.Miss,
			multiplier: hitScore,
			totalScore: hitScore,
			round: currentRound,
			bust: false,
			extra: hit ? hitIndex : undefined,
		}
		clonedDarts.push(newThrow);
		
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer);
		const playerScore = this.getScore(currentPlayer, dartThrows) + hitScore;
		// console.log("playerscore will be", playerScore);

		const scoreMessage = hit ? "hit!" : "miss";
		speak(scoreMessage, true);
		gameController.gameStatus.dartThrows.push(newThrow);

		if (playerScore === this.numBlades) {
			this.finishGame(currentPlayerIndex);
		// Thrown 3 darts
		} else if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound)
			this.roundEnded();

		socketServer.emit(SocketEvent.ADD_DART_THROW, newThrow);
		//setDartThrows(clonedDarts);
		const winner = gameController.gameStatus.winningPlayerIndex;
		if (winner === -1)
			this.draw();
		this.updateScores();
	}

	blades: (number | undefined)[] = [];

	tick = () => {
		// console.log("tick");
		if (this.paused) return this.paused--;
		
		this.blades.forEach((blade, i) => {
			if (blade === undefined) return;
			this.blades[i] = (blade + 1) % 20;
		});

		this.draw();

		ledController.dispatchUpdate();
	}

	draw = () => {
		ledController.setAllOn(false, false); // Clear board
		
		this.blades.forEach((blade, i) => {
			if (blade === undefined) return;
			const score = scoreOrder[blade%20];
			ledController.setScoreOn(score, true, false);
		});

		ledController.dispatchUpdate();
	}

	roundEnded() {
		super.roundEnded();

		this.clearTick();
	}

	clearTick() {
		//console.log("clear tick")
		if (this.tickInterval) {
			clearInterval(this.tickInterval);
			this.tickInterval = undefined;
			ledController.setAllOn(false);
		}
	}

	getFinalScores(): FinalScore[] {
		const { players, dartThrows } = gameController.gameStatus;
		const places: FinalScore[] = players.map((player, i) => ({
			playerName: player,
			place: i,
			score: this.getScore(player, dartThrows) || 0
		})).sort((a, b) => b.score - a.score);
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

export default GameHelicopter;