import { cloneDeep } from "lodash";
import { DartThrow, GameType } from "../../src/types/GameTypes";
import { Hint, Ring } from "../../src/types/LedTypes";
import { SocketEvent, SoundFX } from "../../src/types/SocketTypes";
import gameController from "../gameController";
import ledController from "../ledController";
import { playSound, showPopup, socketServer, speak } from "../socketServer";
import GameBase from "./gameBase";


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
					options: [9, 18, 10, 11, 12, 13, 14, 15, 16, 17, 2],
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
		return 1;
	}
	
	getScore(player: string, dartThrows: DartThrow[]) {
		const darts = dartThrows.filter(t => t.player === player);
		//const score = darts.reduce((score, dart) => score - dart.totalScore, this.startingScore);
		const roundDarts = darts.reduce<DartThrow[][]>((rounds, dart) => { rounds[dart.round] = [ ...rounds[dart.round] || [], dart ]; return rounds; }, []);
		let score = 0;
		roundDarts.forEach(round => {
			const bestScore = this.getRoundScore(round);
			score += bestScore;
		});

		return score;
	}
	
	getRoundScore(roundDarts: DartThrow[]) {
		const bestScore = roundDarts.reduce((acc, dart) => Math.min(this.getRingScore(dart.ring), acc), 1);
		return bestScore;
	}
	nextPlayer(): void {
		super.nextPlayer();
		const { currentPlayerIndex, currentRound } = gameController.gameStatus;
		if (currentPlayerIndex === 0)
			speak("Hole number " + (currentRound + 1));
	}

	getSpokenScore(score: number, ring: Ring): string {
		const { currentRound } = gameController.gameStatus;
		const hole = currentRound + 1;
		if (score !== hole) return "Miss";
		if (ring === Ring.Double) return "Eagle";
		if (ring === Ring.Triple) return "Birdie";
		return "Par";
	}

	addDartThrow(score: number, ring: Ring) {
		const { dartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, winningPlayerIndex } = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		// console.log("addDartThrow", score, ring, currentPlayer);
		
		ledController.flashLed(score, ring);
		if (!players.length || winningPlayerIndex > -1) {
			return;
		}
		if (!waitingForThrow && ring !== Ring.Miss) {
			speak("remove darts and hit next player", true);
			return;
		}

		const hole = currentRound + 1;

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = 1;//this.getMultiplier(ring);
		const totalScore = score === hole ? 1 : 0;// score * multiplier;
		const scoreMessage = this.getSpokenScore(score, ring);
		const newThrow: DartThrow = {
			player: currentPlayer,
			score,
			ring,
			multiplier,
			totalScore,
			round: currentRound,
			bust: false,
			display: scoreMessage,
		}
		clonedDarts.push(newThrow);
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer);
		
		const playerScore = this.getScore(currentPlayer, dartThrows) - totalScore;
		
		//speak(totalScore ? "Hit!" : "Miss");
		// console.log("playerscore will be", playerScore);

		speak(scoreMessage.replace("P", "Pp"), true); // typo here to force proper pronounciation, otherwise reads p-a-r
		showPopup(scoreMessage);
		gameController.gameStatus.dartThrows.push(newThrow);

		// Bust!
		if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound) {
			this.roundEnded();
			if (currentRound === this.holes) {
				// TODO
				this.finishGame(currentPlayerIndex);
			// Thrown 3 darts
			}
		}


		socketServer.emit(SocketEvent.ADD_DART_THROW, newThrow);
		//setDartThrows(clonedDarts);
		this.updateHints();
		this.updateScores();
	};
}

export default GameGolf;