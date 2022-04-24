import { cloneDeep } from "lodash";
import ledController from "../LedController";
//import { speak } from "../../src/store/AudioStore";
import { Base, DartThrow, GameType } from "../../src/types/GameTypes";
import { Hint, Ring } from "../../src/types/LedTypes";
import GameBase from "./GameBase";
import { socketServer, speak } from "../sockerServer";
import gameController from "../gameController";
import { SocketEvent } from "../../src/types/SocketTypes";
import { delay } from "../../src/tools/Utils";

const baseballField = [ 9, 12, 5, 20, 1, 18, 4 ];


export const baseList = [Base.Home, Base.First, Base.Second, Base.Third, Base.Home];
export const runnerOrder = [Base.Dugout, Base.Home, Base.First, Base.Second, Base.Third, Base.Home, Base.Dugout];

class GameBaseball extends GameBase {
	throwsPerRound = 3;
	innings = 9;

	constructor() {
		super({
			name: "Baseball",
			minPlayers: 1,
			maxPlayers: 8,
			gameType: GameType.GameBaseball,
			settingsOptions: [
				{
					name: "Innings",
					propName: "innings",
					options: [9, 8, 7, 6, 10, 11, 12, 2]
				}
			]
		});
	}

	getRoundScore(darts: DartThrow[]) {
		const totalPos = [0, 0, 0];
		for (let i=0; i<3; i++) {
			if (darts[i]?.totalScore === 0)
				totalPos[i] = -1;
			else
				for (let y=0; y<=i; y++)
					if (totalPos[y] >= 0)
						totalPos[y] += darts[i]?.totalScore ?? 0;
		}
		return totalPos.filter(pos => pos >= 4).length;
	}

	getScore(player: string, dartThrows: DartThrow[]) {
		const darts = dartThrows.filter(t => t.player === player);
		const rounds = darts.reduce<DartThrow[][]>((rounds, dart) => { rounds[dart.round] = [ ...rounds[dart.round] || [], dart ]; return rounds; }, []);
		let score = 0;
		rounds.forEach(roundDarts => {
			/*if (roundDarts[2]?.multiplier === 4)
				score += roundDarts.filter(r => r.totalScore > 0).length + 1;
			else if (roundDarts[2]?.multiplier === 3)
				score += roundDarts.filter(r => r.totalScore > 0).length;
			else {*/
			/*const totalPos = [0, 0, 0];
			for (let i=0; i<3; i++) {
				if (roundDarts[i]?.totalScore === 0)
					totalPos[i] = -1;
				else
					for (let y=0; y<=i; y++)
						if (totalPos[y] >= 0)
							totalPos[y] += roundDarts[i]?.totalScore ?? 0;
			}
			console.log("totalPos", totalPos);*/
			score += this.getRoundScore(roundDarts);// totalPos.filter(pos => pos >= 4).length;
			//}
		})

		return score;
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

		let hit = baseballField.includes(score);

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = this.getMultiplier(ring);
		let totalScore = multiplier;
		const inning = currentRound + 1;
		const roundDarts = clonedDarts.filter((dart) => dart.player === currentPlayer && dart.round === currentRound);
		const lastThrow = roundDarts.length === 2;
		if (score === 25 && lastThrow) {
			hit = true;
			totalScore = 4;
		}
		const newThrow: DartThrow = {
			player: currentPlayer,
			score,
			ring,
			multiplier,
			totalScore: hit ? totalScore : 0,
			round: currentRound,
			bust: false,
		}
		clonedDarts.push(newThrow);
		roundDarts.push(newThrow);
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer);
		
		

		const playerScore = this.getScore(currentPlayer, dartThrows) + multiplier;
		// console.log("playerscore will be", playerScore);

		const scoreMessage = hit ? this.getSpokenScore(score, ring) : "miss";
		speak(scoreMessage, true);
		gameController.gameStatus.dartThrows.push(newThrow);
		
		/*if (playerScore === 0) {
			speak("Well done!. " + currentPlayer.name + " wins!");
			finishGame(currentPlayerIndex);
			ledController.animSolidWipe();
		// Thrown 3 darts
		} else */

		socketServer.emit(SocketEvent.ADD_DART_THROW, newThrow);
		//setDartThrows(clonedDarts);
		this.updateHints();
		this.updateScores();

		if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound) {
			const inningRuns = this.getRoundScore(roundDarts);
			if (currentPlayerIndex + 1 === players.length && inning === this.innings) {
				const winningPlayerIndex = this.getWinnerIndex();
				speak("Well done!. " + players[winningPlayerIndex] + " wins!");
				this.finishGame(winningPlayerIndex);
				ledController.animSolidWipe();
			} else {
				speak(currentPlayer + " scored " + inningRuns + " run" + (inningRuns === 1 ? "" : "s"))
				this.roundEnded();
			}
		}
	}

	hasPlayerWon(playerIndex: number): boolean {
		return false;
	}

	getWinnerIndex() {
		const { scores } = gameController.gameStatus;
		let maxScore = scores[0];
		let winnerIndex = 0;
		scores.forEach((score, i) => {
			if (score > maxScore) winnerIndex = i;
		})
		return winnerIndex;
	}
	
	getMultiplier(ring: Ring) {
		if (ring === Ring.Triple) return 3;
		if (ring === Ring.Double || ring === Ring.DoubleBullseye) return 2;
		return 1;
	}

	updateHints(): void {
		
		const {
			players,
			currentPlayerIndex,
			dartThrows,
			currentRound
		} = gameController.gameStatus;

		const currentPlayer = players[currentPlayerIndex];
		const roundDarts = dartThrows.filter((dart) => dart.player === currentPlayer && dart.round === currentRound);

		const hints: Hint[] = [];
		baseballField.forEach(score => {
			hints.push({ score, ring: Ring.InnerSingle });
			hints.push({ score, ring: Ring.OuterSingle });
			hints.push({ score, ring: Ring.Double });
			hints.push({ score, ring: Ring.Triple });
		});
		if (roundDarts.length === 2) {
			hints.push({ score: 25, ring: Ring.DoubleBullseye });
			hints.push({ score: 25, ring: Ring.OuterBullseye });
		}
		ledController.setHints(hints);
	}

	async roundEndedAnim() {
		await delay(500);
		ledController.animWipe();
	}

	getSpokenScore(score: number, ring: Ring) {
		if (ring === Ring.DoubleBullseye || ring === Ring.OuterBullseye) return "homerun";
		if (ring === Ring.Triple) return "triple";
		if (ring === Ring.Double) return "double";
		return "single";
	}
}

export default GameBaseball;