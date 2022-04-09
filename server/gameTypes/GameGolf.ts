import { cloneDeep } from "lodash";
import { DartThrow, GameType } from "../../src/types/GameTypes";
import { Hint, Ring } from "../../src/types/LedTypes";
import { SocketEvent } from "../../src/types/SocketTypes";
import gameController from "../gameController";
import ledController from "../LedController";
import { socketServer, speak } from "../sockerServer";
import GameBase from "./GameBase";


class GameGolf extends GameBase {
	throwsPerRound = 3;
	holes = 9;

	constructor() {
		super({
			name: "Golf",
			minPlayers: 1,
			maxPlayers: 8,
			gameType: GameType.GameGolf,
			settingsIntro: "Select how many holes to play",
			settingsOptions: [
				{
					name: "Holes",
					options: [9, 18, 10, 11, 12, 13, 14, 15, 16, 17],
					propName: "holes",
				}
			]
		});
	}

	updateHints(): void {
		const {
			currentRound
		} = gameController.gameStatus;
		const hints: Hint[] = [];
		const score = currentRound + 1;
		hints.push({ ring:Ring.InnerSingle, score });
		hints.push({ ring:Ring.Triple, score });
		hints.push({ ring:Ring.OuterSingle, score });
		hints.push({ ring:Ring.Double, score });

		ledController.setHints(hints);
	}

	playersSet(): void {
		super.playersSet();
		speak("Hole number 1");
	}

	getRingScore(ring: Ring) {
		if (ring === Ring.InnerSingle || Ring.OuterSingle) return 0;
		if (ring === Ring.Triple) return -1;
		if (ring === Ring.Double) return -2;
		return 2;
	}
	
	getScore(player: string, dartThrows: DartThrow[]) {
		const darts = dartThrows.filter(t => t.player === player);
		//const score = darts.reduce((score, dart) => score - dart.totalScore, this.startingScore);
		const roundDarts = darts.reduce<DartThrow[][]>((rounds, dart) => { rounds[dart.round] = [ ...rounds[dart.round] || [], dart ]; return rounds; }, []);
		let score = 0;
		roundDarts.forEach(round => {
			const bestScore = round.reduce((acc, dart) => Math.min(this.getRingScore(dart.ring)), 2);
			score += bestScore;
		});

		return score;
	}

	nextPlayer(): void {
		super.nextPlayer();
		const { currentPlayerIndex, currentRound } = gameController.gameStatus;
		if (currentPlayerIndex === 0)
			speak("Hole number " + (currentRound + 1));
	}

	addDartThrow(score: number, ring: Ring) {
		const { dartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, winningPlayerIndex } = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		// console.log("addDartThrow", score, ring, currentPlayer);
		
		ledController.flashLed(score, ring);
		if (!players.length || winningPlayerIndex > -1) {
			return;
		}
		if (!waitingForThrow) {
			speak("remove darts and hit next player", true);
			return;
		}

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = 1 ;//this.getMultiplier(ring);
		const totalScore = score * multiplier;
		const newThrow: DartThrow = {
			player: currentPlayer,
			score,
			ring,
			multiplier,
			totalScore,
			round: currentRound,
			bust: false,
		}
		clonedDarts.push(newThrow);
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer);
		
		const playerScore = this.getScore(currentPlayer, dartThrows) - totalScore;
		// console.log("playerscore will be", playerScore);

		const scoreMessage = ring === Ring.Miss ? " miss" : this.getSpokenScore(score, ring);
		speak(scoreMessage, true);
		gameController.gameStatus.dartThrows.push(newThrow);

		// Bust!
		if (playerScore < 0) {
			newThrow.bust = true;
			newThrow.totalScore = 0;
			speak(scoreMessage + "! Bust!!", true);
			this.roundEnded();
		// Winner!
		} else if (currentRound === this.holes) {
			// TODO
			speak("Well done!. " + currentPlayer + " wins!");
			this.finishGame(currentPlayerIndex);
			ledController.animSolidWipe();
		// Thrown 3 darts
		} else if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound)
			this.roundEnded();


		socketServer.emit(SocketEvent.ADD_DART_THROW, newThrow);
		//setDartThrows(clonedDarts);
		this.updateHints();
		this.updateScores();
	};
}

export default GameGolf;