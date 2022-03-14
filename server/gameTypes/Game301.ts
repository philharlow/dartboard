import _, { cloneDeep } from "lodash";
import ledController from "../LedController";
//import { speak } from "../../src/store/AudioStore";
import { DartThrow, GameType } from "../../src/types/GameTypes";
import { Hint, Ring } from "../../src/types/LedTypes";
import { Player } from "../../src/types/PlayerTypes";
import GameBase from "./GameBase";
import { socketServer, speak } from "../sockerServer";
import gameController from "../gameController";
import { SocketEvent } from "../../src/types/SocketTypes";

class Game301 extends GameBase {
	startingScore = 0;
	

	constructor() {
		super({
			name: "301/X01",
			minPlayers: 1,
			maxPlayers: 8,
			pronounciation: ("3o1"),
			gameType: GameType.Game301,
			settingsOptions: [
				{
					name: "Starting Score",
					propName: "startingScore",
					options: [ 301, 501, 601, 701, 101 ]
				},
			],
		});
	}
	
	getScore(player: string, dartThrows: DartThrow[]) {
		const darts = dartThrows.filter(t => t.player === player);
		let score = this.startingScore;
		//const score = darts.reduce((score, dart) => score - dart.totalScore, this.startingScore);
		const roundDarts = darts.reduce<DartThrow[][]>((rounds, dart) => { rounds[dart.round] = [ ...rounds[dart.round] || [], dart ]; return rounds; }, []);
		roundDarts.forEach(round => {
			const bust = round.some(dart => dart.bust);
			if (!bust) {
				const roundScore = round.reduce((acc, dart) => acc + dart.totalScore, 0);
				score -= roundScore;
			}
		})

		return score;
	}

	setOptions() {
		super.setOptions();
		gameController.updateGameStatus({ currentGameName: "" + this.startingScore });
	}

	addDartThrow(score: number, ring: Ring) {
		const { dartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, winningPlayerIndex } = gameController.gameStatus;
		const currentPlayer = players[currentPlayerIndex];
		console.log("addDartThrow", score, ring, currentPlayer);
		
		ledController.flashLed(score, ring);
		if (!players.length || winningPlayerIndex > -1) {
			return;
		}
		if (!waitingForThrow) {
			speak("remove darts and hit next player", true);
			return;
		}

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = this.getMultiplier(ring);
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
		console.log("playerscore will be", playerScore);

		const scoreMessage = ring === Ring.Miss ? " miss" : this.getSpokenScore(score, ring);
		speak(scoreMessage, true);

		// Bust!
		if (playerScore < 0) {
			newThrow.bust = true;
			newThrow.totalScore = 0;
			speak("Bust!!", true);
			this.roundEnded();
		// Winner!
		} else if (playerScore === 0) {
			speak("Well done!. " + currentPlayer + " wins!");
			this.finishGame(currentPlayerIndex);
			ledController.animSolidWipe();
		// Thrown 3 darts
		} else if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound)
			this.roundEnded();


		socketServer.emit(SocketEvent.ADD_DART_THROW, newThrow);
		gameController.gameStatus.dartThrows.push(newThrow);
		//setDartThrows(clonedDarts);
		this.updateHints();
		this.updateScores();
	};

	waitingForThrowSet() {
		super.waitingForThrowSet();
		ledController.animWipe();
	}

	async updateHints() {
		const {
			players,
			currentPlayerIndex,
			dartThrows,
		} = gameController.gameStatus;

		const currentPlayer = players[currentPlayerIndex];
		const score = this.getScore(currentPlayer, dartThrows);

		const hints: Hint[] = [];
		if (score <= 60) {
			if (score === 25)
				hints.push({score: 25, ring: Ring.OuterBullseye });
			if (score === 50)
				hints.push({score: 25, ring: Ring.InnerBullseye });

			for (let i=1; i<=20; i++) {
				if (i === score) {
					hints.push({score: i, ring: Ring.InnerSingle });
					hints.push({score: i, ring: Ring.OuterSingle });
				}
				if (i * 2 === score)
					hints.push({score: i, ring: Ring.Double });
				if (i * 3 === score)
					hints.push({score: i, ring: Ring.Triple });
			}
			//console.log("hints", score, hints)
		}
		ledController.setHints(hints);
	}

	getSpokenScore(score: number, ring: Ring) {
		if (ring === Ring.Miss) return "miss";
		if (ring === Ring.Triple) return "triple " + score;
		const scoreStr = score === 25 ? "bullseye" : ""+score;
		if (ring === Ring.Double || ring === Ring.InnerBullseye) return "double " + scoreStr;
		return scoreStr;
	}
	
	getMultiplier(ring: Ring) {
		if (ring === Ring.Triple) return 3;
		if (ring === Ring.Double || ring === Ring.InnerBullseye) return 2;
		return 1;
	}
}

export default Game301;