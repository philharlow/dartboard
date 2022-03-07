import { cloneDeep } from "lodash";
import ledManager from "../LedManager";
import { speak } from "../store/AudioStore";
import { DartThrow, useGameStore } from "../store/GameStore";
import { Player } from "../store/PlayerStore";
import { Hint, Ring } from "../types/LedTypes";
import GameType from "./GameType";

class Game301 extends GameType {
	startingScore = 0;
	settingsOptions = [
		{
			name: "Starting Score",
			propName: "startingScore",
			options: [ 301, 501, 601, 701, 101 ]
		},
	];

	constructor() {
		super({
			name: "301/501",
			minPlayers: 1,
			maxPlayers: 8,
			pronounciation: ("3o1"),
		});
	}

	setOptions() {
		super.setOptions();
		this.name = "" + this.startingScore;
	}

	getScore(player: Player) {
		const { dartThrows, } = useGameStore.getState();

		const darts = dartThrows.filter(t => t.player === player.name);
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
	
	addDartThrow(score: number, ring: Ring) {
		const { dartThrows, setDartThrows, waitingForThrow, currentRound, players, currentPlayerIndex, finishGame, winningPlayerIndex } = useGameStore.getState();
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

		const clonedDarts = cloneDeep(dartThrows);
		const multiplier = this.getMultiplier(ring);
		const totalScore = score * multiplier;
		const newThrow: DartThrow = {
			player: currentPlayer.name,
			score,
			ring,
			multiplier,
			totalScore,
			round: currentRound,
			bust: false,
		}
		clonedDarts.push(newThrow);
		const playerDarts = clonedDarts.filter(t => t.player === currentPlayer.name);
		
		const playerScore = this.getScore(currentPlayer) - totalScore;
		console.log("playerscore will be", playerScore);

		const scoreMessage = ring === Ring.Miss ? " miss" : this.getSpokenScore(score, ring);
		speak(scoreMessage, true);

		// Bust!
		if (playerScore < 0) {
			newThrow.bust = true;
			newThrow.totalScore = 0;
			// Mark all darts this round as busts
			//playerDarts.filter((d => d.round === currentRound)).forEach(dart => this.bustDart(dart));
			speak("Bust!!", true);
			this.roundEnded();
		// Winner!
		} else if (playerScore === 0) {
			speak("Well done!. " + currentPlayer.name + " wins!");
			finishGame(currentPlayerIndex);
			ledManager.animSolidWipe();
		// Thrown 3 darts
		} else if (playerDarts.filter((d => d.round === currentRound)).length === this.throwsPerRound)
			this.roundEnded();


		setDartThrows(clonedDarts);
		this.updateHints();
	};

	waitingForThrowSet() {
		super.waitingForThrowSet();
		ledManager.animWipe();
	}

	async updateHints() {
		const {
			players,
			currentPlayerIndex,
		} = useGameStore.getState();

		const currentPlayer = players[currentPlayerIndex];
		const score = this.getScore(currentPlayer);

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
		ledManager.setHints(hints);
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